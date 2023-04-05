import React, { useCallback, useReducer } from "react";
import { selectUser } from "../../App/userSlice";
import { useAppSelector } from "../../hooks/reduxHooks";
import { UserSeat } from "../UserSeat/UserSeat";
import styles from "./GameRoom.module.css";
import { gameRoomReducer, initialRoomState, Player, PlayerActionKind } from "./gameRoomReducer";

const GameRoom: React.FC = () => {
    const [gameRoomState, dispatch] = useReducer(gameRoomReducer, initialRoomState);
    const currentUser = useAppSelector(selectUser);

    const joinUserToGame = useCallback((seatId: number) => {
        dispatch({ type: PlayerActionKind.JOIN, payload: { ...currentUser, bet: 0, seatNumber: seatId } });
    }, [currentUser]);

    const removeUserFromGame = useCallback((player: Player) => {
        dispatch({ type: PlayerActionKind.LEAVE, payload: player });
    }, []);

    return (
        <div className={styles.background}>
            {gameRoomState.playersSeats.map((seat, index) => {
                const user = seat !== "empty" ? seat : { name: "", id: "", bet: 0 };
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
                        }}
                    />
                );
            })}
        </div>
    );
};

export { GameRoom };
