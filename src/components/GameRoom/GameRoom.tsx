import React, { useReducer } from "react";
import { selectUser } from "../../App/userSlice";
import { useAppSelector } from "../../hooks/reduxHooks";
import styles from "./GameRoom.module.css";
import { gameRoomReducer, initialRoomState } from "./gameRoomReducer";

const GameRoom: React.FC = () => {
    // Array of players
    // Their names
    // Their bets and places
    // Their respestive cards and sum of them
    const [gameRoomState] = useReducer(gameRoomReducer, initialRoomState);
    const user = useAppSelector(selectUser);
    return (
        <div className={styles.background}>
            {gameRoomState.playersSeats[0] === "empty" && "No player"}
            {user.name}
        </div>
    );
};

export { GameRoom };
