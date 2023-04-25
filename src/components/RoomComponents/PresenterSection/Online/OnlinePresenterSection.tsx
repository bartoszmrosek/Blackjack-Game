import React from "react";
import { PresenterState } from "../../../../types/PresenterState.interface";
import { CardsSpriteLoader } from "../../../CardsSpriteLoader/CardsSpriteLoader";
import styles from "../PresenterSection.module.css";

interface PresenterSectionProps {
    presenter: Omit<PresenterState, "didGetBlackjack">;
}

const OnlinePresenterSection: React.FC<PresenterSectionProps> = (
    { presenter },
) => {
    return (
        <section className={`${styles.presenterContainer} ${styles.onlinePresenter}`} data-testid="presenter-section">
            {presenter.cards.map((card, index) =>
            // eslint-disable-next-line react/no-array-index-key
                <CardsSpriteLoader cardId={card} key={index} />,
            )}
            {presenter.score[0] !== 0 && (
                <div className={styles.presenterScore}>
                    {presenter.score.filter((score, index) => {
                        if (index === 0 || score < 22) { return true; }
                        return false;
                    }).join("/")}
                </div>
            )}
        </section>
    );
};

export { OnlinePresenterSection };
