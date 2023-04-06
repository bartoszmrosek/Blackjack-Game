import React, { useCallback, useReducer, useState } from "react";
import { addReservedBalance, gameFundReservation, removeReservedBalance, selectUser } from "../../App/userSlice";
import { useAppDispatch, useAppSelector } from "../../hooks/reduxHooks";
import { UserSeat } from "./UserSeat/UserSeat";
import styles from "./GameRoom.module.css";
import { gameRoomReducer, initialRoomState, Player, PlayerActionKind, PresenterActionKind } from "./gameRoomReducer";
import { BetOverlay } from "./BetOverlay/BetOverlay";

const GameRoom: React.FC = () => {
    const [gameRoomState, dispatch] = useReducer(gameRoomReducer, initialRoomState);
    const [betsToUpdate, setBetsToUpdate] = useState<Player[]>([]);
    const currentUser = useAppSelector(selectUser);
    const currentUserDispatch = useAppDispatch();

    const removeUserFromGame = useCallback((player: Player) => {
        dispatch({ type: PlayerActionKind.LEAVE, payload: player });
        setBetsToUpdate(bets => {
            return bets.filter((bet) => {
                return bet.id !== player.id && bet.seatNumber !== player.seatNumber;
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
        addBetToUpdate({ ...currentUser, seatNumber: seatId, bet: { currentBet: 0, previousBet: 0 } });
    }, [addBetToUpdate, currentUser]);

    const updateBet = useCallback((player: Player) => {
        const currentBetChange = player.bet.currentBet - player.bet.previousBet;
        if (currentUser.reservedBalance + currentBetChange <= currentUser.balance) {
            dispatch({ type: PlayerActionKind.UPDATE_BET, payload: player });
            setBetsToUpdate(bets => [...bets.slice(1)]);
            currentUserDispatch(addReservedBalance(currentBetChange));
        }
    }, [currentUser.balance, currentUser.reservedBalance, currentUserDispatch]);

    const switchIsGamePlayed = useCallback(() => {
        if (gameRoomState.isGameStarted) {
            const previouslyPlacedBets = gameRoomState.playersSeats.filter((seat) => (seat !== "empty")) as Player[];
            setBetsToUpdate(previouslyPlacedBets.map((bettingPlayer) =>
            ({ ...bettingPlayer, bet: { currentBet: 0, previousBet: bettingPlayer.bet.currentBet } })));
        } else {
            currentUserDispatch(gameFundReservation());
        }
        dispatch({ type: PresenterActionKind.SWITCH_IS_PLAYED });
    }, [currentUserDispatch, gameRoomState.isGameStarted, gameRoomState.playersSeats]);

    return (
        <div className={styles.background}>
            <button onClick={switchIsGamePlayed}>{!gameRoomState.isGameStarted ? "Start game" : "Stop game"}</button>
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
            {betsToUpdate.length > 0 &&
            !gameRoomState.isGameStarted &&
                <BetOverlay playerInformations={betsToUpdate} updateBet={updateBet} undoHandler={removeUserFromGame} />}
        </div>
    );
};

export { GameRoom };
