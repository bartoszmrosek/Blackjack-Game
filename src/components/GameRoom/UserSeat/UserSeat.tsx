import React, { useCallback } from "react";
import { useAppSelector } from "../../../hooks/reduxHooks";
import { Player } from "../gameRoomReducer";

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
    const currentUserId = useAppSelector((state) => state.user.id);

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
        <button onClick={handleJoin}>
            {isGameStarted ? "Join in next round" : "Join now"}
        </button>
    ) : (
        <div>
            <h1>{user.name}</h1>
            <h2 onClick={handleBetChg}>{user.bet.currentBet}</h2>
            {currentUserId === user.id && !isGameStarted && <button onClick={handleLeave}>X</button>}
        </div>
    );
};

export { UserSeat };
