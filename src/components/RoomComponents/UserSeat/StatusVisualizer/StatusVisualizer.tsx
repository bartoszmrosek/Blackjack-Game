import React from "react";
import { RoundPlayer } from "../../../../types/RoundPlayer.interface";
import styles from "./StatusVisualizer.module.css";
import { transformImgUrl } from "../../../../utils/transformImgUrl";

interface StatusVisualizerProps {
    status: RoundPlayer["currentStatus"];
}

const StatusVisualizer: React.FC<StatusVisualizerProps> = ({ status }) => {
    switch (status) {
        case "blackjack":
            return (
                <div className={styles.statusWrapper}>
                    <img
                        src={`${transformImgUrl("/Graphics/StatusIcons/blackjackIcon.svg")}`}
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
                        src={`${transformImgUrl("/Graphics/StatusIcons/winIcon.svg")}`}
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
                        src={`${transformImgUrl("/Graphics/StatusIcons/bustedIcon.svg")}`}
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
                        src={`${transformImgUrl("/Graphics/StatusIcons/lostIcon.svg")}`}
                        className={`${styles.statusImg} ${styles.negativeStatus}`}
                        alt={`User ${status} icon`}
                    />
                    <span className={`${styles.statusText} ${styles.negativeStatus}`}>LOSE</span>
                </div>
            );
        case "push":
            return (
                <div className={styles.statusWrapper}>
                    <img
                        src={`${transformImgUrl("/Graphics/StatusIcons/pushIcon.svg")}`}
                        className={`${styles.statusImg} ${styles.positiveStatus}`}
                        alt={`User ${status} icon`}
                    />
                    <span className={`${styles.statusText} ${styles.positiveStatus}`}>PUSH</span>
                </div>
            );
    }

    return null;
};

export { StatusVisualizer };
