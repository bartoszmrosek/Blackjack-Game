import React, { useCallback, useEffect, useReducer, useState } from "react";
import {
    addBalance,
    addReservedBalance,
    gameFundReservation,
    removeReservedBalance,
    selectUser,
} from "../../App/userSlice";
import { useAppDispatch, useAppSelector } from "../../hooks/reduxHooks";
import { UserSeat } from "../../components/RoomComponents/UserSeat/UserSeat";
import styles from "./GameRoom.module.css";
import { gameRoomReducer, initialRoomState, PlayerActionKind, PresenterActionKind } from "./gameRoomReducer";
import { BetOverlay } from "../../components/RoomComponents/BetOverlay/BetOverlay";
import { Player } from "../../types/Player";
import { useGameLogic } from "../../hooks/useGameLogic/useGameLogic";
import { DecisionOverlay } from "../../components/RoomComponents/DecisionOverlay/DecisionOverlay";
import { PresenterSection } from "../../components/RoomComponents/PresenterSection/PresenterSection";
import { GoBackButton } from "../../components/GoBackButton/GoBackButton";

const GameRoom: React.FC = () => {
    const [gameRoomState, dispatch] = useReducer(gameRoomReducer, initialRoomState);
    const [betsToUpdate, setBetsToUpdate] = useState<Player[]>([]);
    const currentUser = useAppSelector(selectUser);
    const currentUserDispatch = useAppDispatch();
    const [fundsToAdd, setFundsToAdd] = useState<number>(0);

    const stopGame = useCallback((funds: number) => {
        const previouslyPlacedBets = gameRoomState.playersSeats.filter((seat) => (seat !== "empty")) as Player[];
        setBetsToUpdate(previouslyPlacedBets.map((bettingPlayer) =>
            ({ ...bettingPlayer, bet: { currentBet: 0, previousBet: bettingPlayer.bet.currentBet } })));
        setFundsToAdd(funds);
    }, [gameRoomState.playersSeats]);

    const removeUserFromGame = useCallback((player: Player) => {
        dispatch({ type: PlayerActionKind.LEAVE, payload: player });
        setBetsToUpdate(bets => {
            return bets.filter((bet) => {
                return !(bet.id === player.id && bet.seatNumber === player.seatNumber);
            });
        });
        currentUserDispatch(removeReservedBalance(player.bet.currentBet));
    }, [currentUserDispatch]);

    const resetGame = useCallback(() => {
        dispatch({ type: PresenterActionKind.STOP_GAME });
        if (currentUser.balance <= 0) {
            betsToUpdate.forEach((player) => {
                if (player.id === currentUser.id) { removeUserFromGame(player); }
            });
        }
    }, [betsToUpdate, currentUser.balance, currentUser.id, removeUserFromGame]);

    const [setCurrentPlayers, currentPlayers, currentlyAsking, presenterState] = useGameLogic(stopGame, resetGame);

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

    const decisionInterceptor = useCallback((theirIndex: number, decision: "hit" | "stand" | "doubleDown") => {
        if (decision === "doubleDown") {
            const doublingDownPlayer = currentPlayers[theirIndex];
            dispatch({
                type: PlayerActionKind.UPDATE_BET,
                payload: {
                    ...doublingDownPlayer,
                    bet: {
                        ...doublingDownPlayer.bet,
                        currentBet: doublingDownPlayer.bet.currentBet * 2,
                    },
                },
            });
        }
        currentlyAsking?.makeDecision(theirIndex, decision);
    }, [currentPlayers, currentlyAsking]);

    useEffect(() => {
        if (fundsToAdd !== 0) {
            currentUserDispatch(addBalance(fundsToAdd));
            setFundsToAdd(0);
        }
    }, [currentUserDispatch, fundsToAdd]);

    return (
        <main className={styles.background}>
            <PresenterSection presenter={presenterState} startGameCb={startGame} isGameStarted={gameRoomState.isGameStarted} />
            <div className={styles.userSeats}>
                {gameRoomState.playersSeats.map((seat, index) => {
                    const user = seat !== "empty" ? seat :
                        { name: "empty", id: "empty", bet: { currentBet: 0, previousBet: 0 }, seatNumber: index };
                    const isUserPlayerIndex = currentPlayers.findIndex((player) => player.seatNumber === index);
                    const playerStatus = isUserPlayerIndex !== -1 ? {
                        cards: currentPlayers[isUserPlayerIndex].cards,
                        status: currentPlayers[isUserPlayerIndex].currentStatus,
                        scorePermutations: currentPlayers[isUserPlayerIndex].cardsScore,
                    } : null;
                    return (
                        <UserSeat
                    // eslint-disable-next-line react/no-array-index-key
                            key={index}
                            isGameStarted={gameRoomState.isGameStarted}
                            isEmpty={seat === "empty"}
                            isCurrentlyDeciding={currentlyAsking?.currentlyAsking.seatNumber === index}
                            seatId={index}
                            user={user}
                            actions={{
                                userJoin: joinUserToGame,
                                userLeave: removeUserFromGame,
                                userChgBet: addBetToUpdate,
                            }}
                            playerStatus={playerStatus}
                        />
                    );
                })}
            </div>
            <section className={styles.balanceInformations}>
                <section className={styles.userBalance}>
                    <h1 className={styles.balanceHeading}>BALANCE</h1>
                    <p className={styles.balanceContent}>€ {currentUser.balance}</p>
                </section>
                <section className={styles.userAllBets}>
                    <h1 className={styles.balanceHeading}>TOTAL BET</h1>
                    <p className={styles.balanceContent}>
                        € {gameRoomState.playersSeats.reduce((acc, player) => {
                        if (player !== "empty") {
                            return player.bet.currentBet + acc;
                        }
                        return acc;
                    }, 0)}
                    </p>
                </section>
            </section>

            {betsToUpdate.length > 0 &&
            !gameRoomState.isGameStarted &&
            currentUser.balance > 0 &&
                <BetOverlay playerInformations={betsToUpdate[0]} updateBet={updateBet} undoHandler={removeUserFromGame} />}

            {currentlyAsking !== null && (currentlyAsking.currentlyAsking.id === currentUser.id) && (
                <DecisionOverlay
                    decisionCb={decisionInterceptor}
                    theirIndex={currentlyAsking.currentlyAsking.theirIndex}
                    currentBet={currentlyAsking.currentlyAsking.bet.currentBet}
                />
            )}
            <GoBackButton />
        </main>
    );
};

export { GameRoom };
