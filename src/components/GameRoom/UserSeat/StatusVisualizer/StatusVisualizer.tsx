import React from "react";
import { RoundPlayer } from "../../../../hooks/useGameLogic/gamelogicReducer";
import styles from "./StatusVisualizer.module.css";

interface StatusVisualizerProps {
    status: RoundPlayer["currentStatus"];
}

const StatusVisualizer: React.FC<StatusVisualizerProps> = ({ status }) => {
    switch (status) {
        case "blackjack":
            return (
                <div className={styles.statusWrapper}>
                    <img
                        src="./Graphics/StatusIcons/blackjackIcon.svg"
                        className={`${styles.statusImg} ${styles.positiveStatus}`}
                        alt={`User ${status} icon`}
                    />
                    <span className={`${styles.statusText} ${styles.positiveStatus}`}>BLACKJACK</span>
                </div>
            );
        case "won":
            return (
                <div className={styles.statusWrapper}>
                    <img
                        src="./Graphics/StatusIcons/winIcon.svg"
                        className={`${styles.statusImg} ${styles.positiveStatus}`}
                        alt={`User ${status} icon`}
                    />
                    <span className={`${styles.statusText} ${styles.positiveStatus}`}>WIN</span>
                </div>
            );
        case "bust":
            return (
                <div className={styles.statusWrapper}>
                    <img
                        src="./Graphics/StatusIcons/bustedIcon.svg"
                        className={`${styles.statusImg} ${styles.negativeStatus}`}
                        alt={`User ${status} icon`}
                    />
                    <span className={`${styles.statusText} ${styles.negativeStatus}`}>BUST</span>
                </div>
            );
        case "lost":
            return (
                <div className={styles.statusWrapper}>
                    <img
                        src="./Graphics/StatusIcons/lostIcon.svg"
                        className={`${styles.statusImg} ${styles.negativeStatus}`}
                        alt={`User ${status} icon`}
                    />
                    <span className={`${styles.statusText} ${styles.negativeStatus}`}>LOSE</span>
                </div>
            );
    }

    return null;
};

export { StatusVisualizer };
