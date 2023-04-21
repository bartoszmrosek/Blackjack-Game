import React, { useCallback } from "react";
import styles from "./Rooms.module.css";

interface JoinBtnSubcomponentProps {
    roomId: string;
}

const JoinBtnSubcomponent: React.FC<JoinBtnSubcomponentProps> = ({ roomId }) => {
    const joiningHandler = useCallback(() => {
        // placeholder for now
        console.log(roomId);
    }, [roomId]);
    return (
        <td className={styles.tableTd}>
            <button className={styles.joinGameBtn} onClick={joiningHandler}>Join</button>
        </td>
    );
};

export { JoinBtnSubcomponent };
