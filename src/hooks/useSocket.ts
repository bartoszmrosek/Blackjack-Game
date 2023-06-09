import { useContext, useEffect, useState } from "react";
import { SocketContext } from "../Contexts/SocketContext";
import { GameState, GameStatusObject, TypedSocket } from "../types/Socket.interfaces";
import { updateArrAt } from "../utils/updateArrAt";
import {
    OnlineActivePlayer as ActiveUserSeat,
    PlayerBets,
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
    timer: { time: number; message?: string; };
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

const useSocket = (userId: number, pushBetsToUpdate?: (seatBets: PlayerBets[]) => void): UseSocketReturn => {
    const [timer, setTimer] = useState<{ time: number; message?: string; }>({ time: 0 });
    const [seats, setSeats] = useState<("empty" | UserSeat | ActiveUserSeat)[]>(initialSeats);
    const [gameState, setGameState] = useState<GameState>(initialGameState);
    const [presenterState, setPresenterState] = useState<PresenterState>(initialPresenterState);
    const [currentlyAsking, setCurrentlyAsking] = useState<CurrentlyAsking>(initialCurrentlyAsking);
    const [additionalMessage, setAdditionalMessage] = useState("");
    const onlineUserDispatch = useAppDispatch();

    const socket = useContext(SocketContext);

    function updateGameStatus(gameStatus: GameStatusObject, timerMessage?: string) {
        const combinedUsers: UserSeat[] = [...gameStatus.pendingPlayers, ...gameStatus.activePlayers];
        const newUsersState: ("empty" | UserSeat)[] = [...initialSeats];
        combinedUsers.forEach((user) => {
            newUsersState[user.seatId] = user;
        });
        setSeats(newUsersState);
        setPresenterState(gameStatus.presenterState);
        setGameState(gameStatus.gameState);
        setCurrentlyAsking(gameStatus.currentlyAsking);
        setTimer({ time: gameStatus.timer, message: timerMessage });
    }

    useEffect(() => {
        if (socket !== null) {
            socket.on("gameTimerStarting", (timeout) => {
                setTimeout(() => {
                    if (pushBetsToUpdate) {
                        pushBetsToUpdate([]);
                    }
                }, timeout);
                setTimer({ time: timeout });
            });
            socket.on("userJoinedSeat", (seat) => {
                const { timer: seatTimer, ...restOfSeat } = seat;
                setAdditionalMessage(`${seat.username} joined on seat ${seat.seatId + 1}`);
                setSeats(prev => updateArrAt(prev, seat.seatId, { ...restOfSeat, bet: 0, previousBet: 0 }));
                setTimer({ time: seatTimer });
            });
            socket.on("userLeftSeat", (seat, updatedBalance) => {
                onlineUserDispatch(updateBalance(updatedBalance));
                setAdditionalMessage(`${seat.username} left the seat ${seat.seatId + 1}`);
                setSeats(prev => updateArrAt(prev, seat.seatId, "empty"));
            });
            socket.on("betPlaced", (bet, seatId, newTimer, updatedBalance) => {
                onlineUserDispatch(updateBalance(updatedBalance));
                setTimer({ time: newTimer });
                setAdditionalMessage(`${bet} placed on seat no. ${seatId + 1}`);
                setSeats(prev => updateArrAt(prev, seatId, { ...prev[seatId] as UserSeat, bet }));
            });
            socket.on("gameStatusUpdate", (gameStatus) => {
                updateGameStatus(gameStatus);
                if (gameStatus.pendingPlayers.length === 0 && gameStatus.activePlayers.length === 0) {
                    setAdditionalMessage("Not enough players to start");
                }
                if (gameStatus.gameState.isGameStarting && pushBetsToUpdate) {
                    const playersToUpdateBet = gameStatus.pendingPlayers.filter(
                        (player) => player.previousBet !== 0 && userId === player.userId,
                    );
                    pushBetsToUpdate(playersToUpdateBet);
                }
            });
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
                setTimer(prev => ({ time: prev.time !== 10000 ? 10000 : 9000 }));
                setCurrentlyAsking({ seatId, userId, cb });
            });
            socket.on("presenterTime", (gameStatus) => {
                setTimer({ time: 0 });
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
                updateGameStatus(gameStatus, "Game resets in:");
            });
            socket.on("balanceUpdate", (balance) => {
                onlineUserDispatch(updateBalance(balance));
            });
            socket.on("gameStarts", (gameStatus) => {
                setAdditionalMessage("Game has started");
                updateGameStatus(gameStatus);
                if (pushBetsToUpdate) {
                    pushBetsToUpdate([]);
                }
            });
        }
        return () => {
            socket?.removeAllListeners();
        };
    }, [onlineUserDispatch, pushBetsToUpdate, seats, socket, userId]);

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
