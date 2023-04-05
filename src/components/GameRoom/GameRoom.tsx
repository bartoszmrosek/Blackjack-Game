import React, { useCallback, useReducer, useState } from "react";
import { selectUser } from "../../App/userSlice";
import { useAppSelector } from "../../hooks/reduxHooks";
import { UserSeat } from "./UserSeat/UserSeat";
import styles from "./GameRoom.module.css";
import { gameRoomReducer, initialRoomState, Player, PlayerActionKind } from "./gameRoomReducer";
import { BetOverlay } from "./BetOverlay/BetOverlay";

const GameRoom: React.FC = () => {
    const [gameRoomState, dispatch] = useReducer(gameRoomReducer, initialRoomState);
    const [betsToUpdate, setBetsToUpdate] = useState<Player[]>([]);
    const currentUser = useAppSelector(selectUser);

    const removeUserFromGame = useCallback((player: Player) => {
        dispatch({ type: PlayerActionKind.LEAVE, payload: player });
        setBetsToUpdate(bets => {
            return bets.filter((bet) => {
                return bet.id !== player.id && bet.seatNumber !== player.seatNumber;
            });
        });
    }, []);

    const addBetToUpdate = useCallback((player: Player) => {
        setBetsToUpdate(bets => [...bets, player]);
    }, []);

    const joinUserToGame = useCallback((seatId: number) => {
        dispatch({ type: PlayerActionKind.JOIN, payload: { ...currentUser, bet: { currentBet: 0, previousBet: 0 }, seatNumber: seatId } });
        addBetToUpdate({ ...currentUser, seatNumber: seatId, bet: { currentBet: 0, previousBet: 0 } });
    }, [addBetToUpdate, currentUser]);

    const updateBet = useCallback((player: Player) => {
        dispatch({ type: PlayerActionKind.UPDATE_BET, payload: player });
        setBetsToUpdate(bets => [...bets.slice(1)]);
    }, []);

    return (
        <div className={styles.background}>
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
            {betsToUpdate.length > 0 && <BetOverlay playerInformations={betsToUpdate} updateBet={updateBet} />}
        </div>
    );
};

export { GameRoom };
