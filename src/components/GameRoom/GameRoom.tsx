import React, { useCallback, useEffect, useReducer, useState } from "react";
import {
    addBalance,
    addReservedBalance,
    gameFundReservation,
    removeReservedBalance,
    selectUser,
} from "../../App/userSlice";
import { useAppDispatch, useAppSelector } from "../../hooks/reduxHooks";
import { UserSeat } from "./UserSeat/UserSeat";
import styles from "./GameRoom.module.css";
import { gameRoomReducer, initialRoomState, PlayerActionKind, PresenterActionKind } from "./gameRoomReducer";
import { BetOverlay } from "./BetOverlay/BetOverlay";
import { Player } from "../../types/Player";
import { useGameLogic } from "../../hooks/useGameLogic/useGameLogic";
import { DecisionOverlay } from "./DecisionOverlay/DecisionOverlay";

const GameRoom: React.FC = () => {
    const [gameRoomState, dispatch] = useReducer(gameRoomReducer, initialRoomState);
    const [betsToUpdate, setBetsToUpdate] = useState<Player[]>([]);
    const currentUser = useAppSelector(selectUser);
    const currentUserDispatch = useAppDispatch();
    const [fundsToAdd, setFundsToAdd] = useState<number>(0);

    const stopGame = useCallback((funds: number) => {
        dispatch({ type: PresenterActionKind.STOP_GAME });
        const previouslyPlacedBets = gameRoomState.playersSeats.filter((seat) => (seat !== "empty")) as Player[];
        setBetsToUpdate(previouslyPlacedBets.map((bettingPlayer) =>
            ({ ...bettingPlayer, bet: { currentBet: 0, previousBet: bettingPlayer.bet.currentBet } })));
        setFundsToAdd(funds);
    }, [gameRoomState.playersSeats]);

    const [setCurrentPlayers, gamePlayers, currentlyAsking, presenterScore] = useGameLogic(stopGame);

    const removeUserFromGame = useCallback((player: Player) => {
        dispatch({ type: PlayerActionKind.LEAVE, payload: player });
        setBetsToUpdate(bets => {
            return bets.filter((bet) => {
                return !(bet.id === player.id && bet.seatNumber === player.seatNumber);
            });
        });
        currentUserDispatch(removeReservedBalance(player.bet.currentBet));
    }, [currentUserDispatch]);

    const addBetToUpdate = useCallback((player: Player) => {
        setBetsToUpdate(bets => [...bets, player]);
    }, []);

    const joinUserToGame = useCallback((seatId: number) => {
        const newPlayer: Player = {
            id: currentUser.id,
            name: currentUser.name,
            bet: { currentBet: 0, previousBet: 0 },
            seatNumber: seatId,
        };
        dispatch({ type: PlayerActionKind.JOIN, payload: newPlayer });
        addBetToUpdate(newPlayer);
    }, [addBetToUpdate, currentUser]);

    const updateBet = useCallback((player: Player) => {
        const currentBetChange = player.bet.currentBet - player.bet.previousBet;
        if (currentUser.reservedBalance + currentBetChange <= currentUser.balance) {
            dispatch({ type: PlayerActionKind.UPDATE_BET, payload: player });
            setBetsToUpdate(bets => [...bets.slice(1)]);
            currentUserDispatch(addReservedBalance(currentBetChange));
        }
    }, [currentUser.balance, currentUser.reservedBalance, currentUserDispatch]);

    const startGame = useCallback(() => {
        if (!gameRoomState.isGameStarted) {
            currentUserDispatch(gameFundReservation());
            const allCurrentPlayers = gameRoomState.playersSeats.filter(player => player !== "empty") as Player[];
            if (allCurrentPlayers.length > 0) {
                setCurrentPlayers(allCurrentPlayers);
                dispatch({ type: PresenterActionKind.START_GAME });
            }
        }
    }, [currentUserDispatch, gameRoomState.isGameStarted, gameRoomState.playersSeats, setCurrentPlayers]);

    useEffect(() => {
        if (fundsToAdd > 0) {
            currentUserDispatch(addBalance(fundsToAdd));
            setFundsToAdd(0);
        }
    }, [currentUserDispatch, fundsToAdd]);
    return (
        <div className={styles.background}>
            <button onClick={startGame} disabled={gameRoomState.isGameStarted}>Start game</button>
            <div className={styles.userSeats}>
                {gameRoomState.playersSeats.map((seat, index) => {
                    const user = seat !== "empty" ? seat : { name: "", id: "", bet: { currentBet: 0, previousBet: 0 }, seatNumber: index };
                    return (
                        <UserSeat
                    // eslint-disable-next-line react/no-array-index-key
                            key={index}
                            isGameStarted={gameRoomState.isGameStarted}
                            isEmpty={seat === "empty"}
                            seatId={index}
                            user={user}
                            actions={{
                                userJoin: joinUserToGame,
                                userLeave: removeUserFromGame,
                                userChgBet: addBetToUpdate,
                            }}
                        />
                    );
                })}
            </div>
            <p>User balance: {currentUser.balance}</p>

            {betsToUpdate.length > 0 &&
            !gameRoomState.isGameStarted &&
            currentUser.balance > 0 &&
                <BetOverlay playerInformations={betsToUpdate} updateBet={updateBet} undoHandler={removeUserFromGame} />}

            {currentlyAsking !== null && (currentlyAsking.currentlyAsking.id === currentUser.id) && (
                <DecisionOverlay
                    decisionCb={currentlyAsking.makeDecision}
                    theirIndex={currentlyAsking.currentlyAsking.theirIndex}
                    presenterScore={presenterScore}
                    playerScore={
                        gamePlayers.find(
                            (player) => player.id === currentlyAsking.currentlyAsking.id &&
                            player.seatNumber === currentlyAsking.currentlyAsking.seatNumber)?.cardsScore
                        }
                    currentBet={currentlyAsking.currentlyAsking.bet.currentBet}
                />
            )}
        </div>
    );
};

export { GameRoom };
