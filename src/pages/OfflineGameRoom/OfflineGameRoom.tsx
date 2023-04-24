import React, { useCallback, useEffect, useReducer, useState } from "react";
import {
    addOfflineBalance,
    addOfflineReservedBalance,
    offlineGameFundReservation,
    removeReservedBalance,
} from "../../App/offlineUserSlice";
import { useAppDispatch, useAppSelector } from "../../hooks/reduxHooks";
import { OffLineUserSeat } from "../../components/RoomComponents/UserSeat/Offline/OfflineUserSeat";
import styles from "./OfflineGameRoom.module.css";
import { gameRoomReducer, initialRoomState, PlayerActionKind, PresenterActionKind } from "./gameRoomReducer";
import { OfflineBetOverlay } from "../../components/RoomComponents/BetOverlay/Offline/OfflineBetOverlay";
import { OfflinePlayer } from "../../types/Player.interface";
import { useGameLogic } from "../../hooks/useGameLogic/useGameLogic";
import { DecisionOverlay } from "../../components/RoomComponents/DecisionOverlay/DecisionOverlay";
import {
    OfflinePresenterSection,
} from "../../components/RoomComponents/PresenterSection/Offline/OfflinePresenterSection";
import { GoBackButton } from "../../components/Overlays/GoBackButton/GoBackButton";
import { BalanceInformations } from "../../components/Overlays/BalanceInformations/BalanceInformations";

const OfflineGameRoom: React.FC = () => {
    const [gameRoomState, dispatch] = useReducer(gameRoomReducer, initialRoomState);
    const { playersSeats, isGameStarted } = gameRoomState;
    const [betsToUpdate, setBetsToUpdate] = useState<OfflinePlayer[]>([]);
    const currentUser = useAppSelector((state) => state.offlineUser);
    const currentUserDispatch = useAppDispatch();
    const [fundsToAdd, setFundsToAdd] = useState<number>(0);
    const [isTooSmallRes, setIsTooSmallRes] = useState(window.innerHeight < 800 || window.innerWidth < 1200);

    const stopGame = useCallback((funds: number) => {
        const previouslyPlacedBets = playersSeats.filter((seat) => (seat !== "empty")) as OfflinePlayer[];
        setBetsToUpdate(previouslyPlacedBets.map((bettingPlayer) =>
            ({ ...bettingPlayer, bet: { currentBet: 0, previousBet: bettingPlayer.bet.currentBet } })));
        setFundsToAdd(funds);
    }, [playersSeats]);

    const removeUserFromGame = useCallback((player: OfflinePlayer) => {
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

    const addBetToUpdate = useCallback((player: OfflinePlayer) => {
        setBetsToUpdate(bets => [...bets, player]);
    }, []);

    const updateBet = useCallback((player: OfflinePlayer) => {
        const currentBetChange = player.bet.currentBet - player.bet.previousBet;
        if (currentUser.reservedBalance + currentBetChange <= currentUser.balance) {
            dispatch({ type: PlayerActionKind.UPDATE_BET, payload: player });
            setBetsToUpdate(bets => [...bets.slice(1)]);
            currentUserDispatch(addOfflineReservedBalance(currentBetChange));
        }
    }, [currentUser.balance, currentUser.reservedBalance, currentUserDispatch]);

    const joinUserToGame = useCallback((seatId: number) => {
        const indexOfOtherSeatBet = playersSeats.findIndex((player) => {
            return player !== "empty" && player.id === currentUser.id;
        });
        const betFromOtherSeat = playersSeats[indexOfOtherSeatBet] as OfflinePlayer;
        const newPlayer: OfflinePlayer = {
            id: currentUser.id,
            name: currentUser.username,
            bet: {
                currentBet: indexOfOtherSeatBet !== -1 ? betFromOtherSeat.bet.currentBet : 0,
                previousBet: 0,
            },
            seatNumber: seatId,
        };
        dispatch({ type: PlayerActionKind.JOIN, payload: newPlayer });
        if (indexOfOtherSeatBet === -1) {
            addBetToUpdate(newPlayer);
        } else {
            currentUserDispatch(addOfflineReservedBalance(betFromOtherSeat.bet.currentBet));
        }
    }, [addBetToUpdate, currentUser.id, currentUser.username, currentUserDispatch, playersSeats]);

    const startGame = useCallback(() => {
        if (!isGameStarted) {
            currentUserDispatch(offlineGameFundReservation());
            const allCurrentPlayers = playersSeats.filter(player => player !== "empty") as OfflinePlayer[];
            if (allCurrentPlayers.length > 0) {
                setCurrentPlayers(allCurrentPlayers);
                dispatch({ type: PresenterActionKind.START_GAME });
            }
        }
    }, [currentUserDispatch, isGameStarted, playersSeats, setCurrentPlayers]);

    const decisionInterceptor = useCallback((decision: "hit" | "stand" | "doubleDown", theirIndex?: number) => {
        if (theirIndex !== undefined) {
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
            currentlyAsking?.makeDecision(decision, theirIndex);
        }
    }, [currentPlayers, currentlyAsking]);

    useEffect(() => {
        if (fundsToAdd !== 0) {
            currentUserDispatch(addOfflineBalance(fundsToAdd));
            setFundsToAdd(0);
        }
    }, [currentUserDispatch, fundsToAdd]);

    useEffect(() => {
        // Needs to work somehow on mobile, possible solution is that application only works on landscape orientation ?
        const handleResize = () => {
            setIsTooSmallRes(window.innerHeight < 800 || window.innerWidth < 1200);
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
        <main className={styles.background}>
            {!isTooSmallRes ? (
                <>
                    <OfflinePresenterSection
                        presenter={presenterState}
                        startGameCb={startGame}
                        isGameStarted={isGameStarted}
                        isAnyPlayerInSeat={playersSeats.some((seat) => seat !== "empty")}
                    />
                    <div className={styles.userSeats}>
                        {playersSeats.map((seat, index) => {
                            const user = seat !== "empty" ? seat :
                                { name: "empty", id: "empty", bet: { currentBet: 0, previousBet: 0 }, seatNumber: index };
                            const isUserPlayerIndex = currentPlayers.findIndex((player) => player.seatNumber === index);
                            const playerStatus = isUserPlayerIndex !== -1 ? {
                                cards: currentPlayers[isUserPlayerIndex].cards,
                                status: currentPlayers[isUserPlayerIndex].currentStatus,
                                scorePermutations: currentPlayers[isUserPlayerIndex].cardsScore,
                            } : null;
                            return (
                                <OffLineUserSeat
                        // eslint-disable-next-line react/no-array-index-key
                                    key={index}
                                    isGameStarted={isGameStarted}
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
                    <BalanceInformations
                        totalInBets={playersSeats.reduce((acc, player) => {
                            if (player !== "empty") {
                                return player.bet.currentBet + acc;
                            }
                            return acc;
                        }, 0)}
                        shouldDisplayBets={true}
                        currentBalance={currentUser.balance}
                    />

                    {betsToUpdate.length > 0 &&
                !isGameStarted &&
                currentUser.balance > 0 &&
                    <OfflineBetOverlay playerInformations={betsToUpdate[0]} updateBet={updateBet} undoHandler={removeUserFromGame} />}

                    {currentlyAsking !== null && (currentlyAsking.currentlyAsking.id === currentUser.id) && (
                        <DecisionOverlay
                            decisionCb={decisionInterceptor}
                            theirIndex={currentlyAsking.currentlyAsking.theirIndex}
                            currentBet={currentlyAsking.currentlyAsking.bet.currentBet}
                            isInOnlineMode={false}
                        />
                    )}
                </>
            ) : (
                <div className={styles.notSupportedDevice}>
                    <h1>Too small device</h1>
                    <p>Switch to desktop computer to play the game!</p>
                </div>
            )}
            <GoBackButton />
        </main>
    );
};

export { OfflineGameRoom };
