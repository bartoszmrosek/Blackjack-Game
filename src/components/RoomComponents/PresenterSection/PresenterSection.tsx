import React from "react";
import { PresenterState } from "../../../types/PresenterState.interface";
import { CardsSpriteLoader } from "../../CardsSpriteLoader/CardsSpriteLoader";
import styles from "./PresenterSection.module.css";

interface PresenterSectionProps {
    presenter: PresenterState;
    isGameStarted: boolean;
    isAnyPlayerInSeat: boolean;
    startGameCb: () => void;
}

const PresenterSection: React.FC<PresenterSectionProps> = (
    { presenter, isGameStarted, isAnyPlayerInSeat, startGameCb },
) => {
    return (
        <section className={styles.presenterContainer} data-testid="presenter-section">
            {!isGameStarted ? (
                <>
                    {isAnyPlayerInSeat &&
                        <button onClick={startGameCb} className={styles.startGameBtn}>Start game</button>
                   }
                </>
            ) : (
                <>
                    {presenter.cards.map((card, index) =>
                        // eslint-disable-next-line react/no-array-index-key
                        <CardsSpriteLoader cardId={card} key={index} />,
                    )}
                    <div className={styles.presenterScore}>
                        {presenter.score.filter((score, index) => {
                            if (index === 0 || score < 22) { return true; }
                            return false;
                        }).join("/")}
                    </div>
                </>
            )}
        </section>
    );
};

export { PresenterSection };
