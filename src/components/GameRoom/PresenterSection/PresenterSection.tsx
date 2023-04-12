import React from "react";
import { PresenterState } from "../../../types/PresenterState";
import { CardsSpriteLoader } from "../../CardsSpriteLoader/CardsSpriteLoader";
import styles from "./PresenterSection.module.css";

interface PresenterSectionProps {
    presenter: PresenterState;
    isGameStarted: boolean;
    startGameCb: () => void;
}

const PresenterSection: React.FC<PresenterSectionProps> = ({ presenter, isGameStarted, startGameCb }) => {
    return (
        <section className={styles.presenterContainer}>
            {!isGameStarted ? (
                <button onClick={startGameCb} className={styles.startGameBtn}>Start game</button>
            ) : (
                <>
                    {presenter.cards.map((card, index) =>
                        // eslint-disable-next-line react/no-array-index-key
                        <CardsSpriteLoader cardId={card} key={index} />,
                    )}
                    <div className={styles.presenterScore}>
                        {presenter.score.filter((score, index) => {
                            if (index === 0 || score < 21) { return true; }
                            return false;
                        }).join("/")}
                    </div>
                </>
            )}
        </section>
    );
};

export { PresenterSection };
