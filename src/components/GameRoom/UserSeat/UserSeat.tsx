import React, { useCallback } from "react";
import { useAppSelector } from "../../../hooks/reduxHooks";
import { Player } from "../../../types/Player";
import styles from "./UserSeat.module.css";

interface UserSeatProps {
    isEmpty: boolean;
    seatId: number;
    user: Player;
    actions: {
        userJoin: (seatId: number) => void;
        userLeave: (player: Player) => void;
        userChgBet: (player: Player) => void;
    };
    isGameStarted: boolean;
}

const UserSeat: React.FC<UserSeatProps> = ({ isEmpty, user, actions, seatId, isGameStarted }) => {
    const currentUser = useAppSelector((state) => state.user);

    const handleJoin = useCallback(() => {
        actions.userJoin(seatId);
    }, [actions, seatId]);

    const handleLeave = useCallback(() => {
        actions.userLeave({ ...user, seatNumber: seatId });
    }, [actions, seatId, user]);

    const handleBetChg = useCallback(() => {
        if (!isGameStarted) {
            actions.userChgBet(user);
        }
    }, [actions, isGameStarted, user]);

    return isEmpty ? (
        <button
            onClick={handleJoin}
            className={`${styles.joinBtn} ${styles.seat}`}
            disabled={currentUser.balance <= 0}
        >
            {
                currentUser.balance <= 0 ? "No funds left" :
                    isGameStarted ? "Join in next round" : "Join now"
            }
        </button>
    ) : (
        <div className={`${styles.activePlayer} ${styles.seat}`}>
            <h1>{user.name}</h1>
            <h2 onClick={handleBetChg}>{user.bet.currentBet}</h2>
            {currentUser.id === user.id && !isGameStarted && <button onClick={handleLeave}>X</button>}
        </div>
    );
};

export { UserSeat };
