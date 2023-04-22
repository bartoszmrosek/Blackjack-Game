import { useContext, useEffect, useState } from "react";
import { SocketContext } from "../Contexts/SocketContext";
import { GameState, GameStatusObject, TypedSocket } from "../types/Socket.interfaces";
import { updateArrAt } from "../utils/updateArrAt";
import {
    OnlineActivePlayer as ActiveUserSeat,
    PlayerDecision,
    OnlinePendingPlayer as UserSeat,
} from "../types/Player.interface";
import { getAllPermutations } from "../utils/getAllPermutations";
import { getCardValues } from "../utils/getCardValues";
import { useAppDispatch } from "./reduxHooks";
import { updateBalance } from "../App/onlineUserSlice";

type PresenterState = {
    cards: string[];
    score: number[];
};

type CurrentlyAsking = {
    userId: number;
    seatId: number;
    cb?: (decision: PlayerDecision) => void;
} | null;

type UseSocketReturn = Readonly<
{
    socket: TypedSocket | null;
    timer: number;
    seats: ("empty" | UserSeat)[];
    gameState: GameState;
    presenterState: PresenterState;
    currentlyAsking: CurrentlyAsking;
    additionalMessage: string;
}
>;

const initialSeats: "empty"[] = ["empty", "empty", "empty", "empty", "empty"];
const initialGameState: GameState = {
    isGameFinished: false,
    isGameStarted: false,
    isGameStarting: false,
};
const initialPresenterState: PresenterState = {
    cards: [],
    score: [0],
};
const initialCurrentlyAsking: CurrentlyAsking = null;

const useSocket = (userId: number): UseSocketReturn => {
    const [timer, setTimer] = useState(0);
    const [seats, setSeats] = useState<("empty" | UserSeat | ActiveUserSeat)[]>(initialSeats);
    const [gameState, setGameState] = useState<GameState>(initialGameState);
    const [presenterState, setPresenterState] = useState<PresenterState>(initialPresenterState);
    const [currentlyAsking, setCurrentlyAsking] = useState<CurrentlyAsking>(initialCurrentlyAsking);
    const [additionalMessage, setAdditionalMessage] = useState("");
    const onlineUserDispatch = useAppDispatch();

    const socket = useContext(SocketContext);

    function updateGameStatus(gameStatus: GameStatusObject) {
        const combinedUsers: UserSeat[] = [...gameStatus.pendingPlayers, ...gameStatus.activePlayers];
        const newUsersState: ("empty" | UserSeat)[] = [...initialSeats];
        combinedUsers.forEach((user) => {
            newUsersState[user.seatId] = user;
        });
        setSeats(newUsersState);
        setPresenterState(gameStatus.presenterState);
        setGameState(gameStatus.gameState);
        setCurrentlyAsking(gameStatus.currentlyAsking);
    }

    useEffect(() => {
        if (socket !== null) {
            socket.on("gameTimerStarting", (timeout) => setTimer(timeout));
            socket.on("userJoinedSeat", (seat) => {
                setSeats(prev => updateArrAt(prev, seat.seatId, { ...seat, bet: 0 }));
            });
            socket.on("userLeftSeat", (seat) => setSeats(prev => updateArrAt(prev, seat.seatId, "empty")));
            socket.on("userLeftGame", (newUserId) => setSeats(prev => prev.map((seat) => {
                if (seat === "empty" || seat.userId === newUserId) {
                    return "empty";
                }
                return seat;
            })));
            socket.on("betPlaced", (bet, seatId) => setSeats(prev => updateArrAt(prev, seatId, { ...prev[seatId] as UserSeat, bet })));
            socket.on("gameStatusUpdate", updateGameStatus);
            socket.on("askingStatusUpdate", (askingState) => {
                setCurrentlyAsking(askingState);
            });
            socket.on("userMadeDecision", (whoWasAsked, decision, possibleCard) => {
                const indexOfSeat = seats.findIndex((seat) => seat !== "empty" && seat.seatId === whoWasAsked?.seatId);
                if (indexOfSeat !== -1) {
                    const seatToChg = seats[indexOfSeat] as ActiveUserSeat;
                    setSeats(prev => {
                        return updateArrAt(prev, indexOfSeat, {
                            ...seatToChg,
                            decision,
                            cards: possibleCard ? [...seatToChg.cards, possibleCard] : seatToChg.cards,
                            cardsScore: possibleCard ?
                                getAllPermutations(seatToChg.cardsScore, getCardValues(possibleCard)) : seatToChg.cardsScore,
                        });
                    });
                }
            });
            socket.on("getPlayerDecision", (seatId, cb) => {
                setCurrentlyAsking({ seatId, userId, cb });
            });
            socket.on("presenterTime", (gameStatus) => {
                setAdditionalMessage("All players have made decisions");
                updateGameStatus(gameStatus);
            });
            socket.on("newPresenterCard", (newCard) => {
                setPresenterState(prev => ({
                    cards: [...prev.cards, newCard],
                    score: getAllPermutations(prev.score, getCardValues(newCard)),
                }));
            });
            socket.on("gameEnded", (gameStatus) => {
                setAdditionalMessage("Game has ended");
                updateGameStatus(gameStatus);
            });
            socket.on("balanceUpdate", (balance) => {
                onlineUserDispatch(updateBalance(balance));
            });
            socket.on("gameStarts", (gameStatus) => {
                setAdditionalMessage("Game has started");
                updateGameStatus(gameStatus);
            });
        }
        return () => {
            socket?.removeAllListeners();
        };
    }, [onlineUserDispatch, seats, socket, userId]);

    useEffect(() => {
        let messageTimeout: NodeJS.Timeout;
        if (additionalMessage) {
            messageTimeout = setTimeout(() => {
                setAdditionalMessage("");
            }, 5000);
        }
        return () => clearTimeout(messageTimeout);
    }, [additionalMessage]);

    return {
        socket,
        timer,
        seats,
        gameState,
        currentlyAsking,
        presenterState,
        additionalMessage,
    };
};

export { useSocket };
