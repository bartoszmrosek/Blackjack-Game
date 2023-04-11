import React, { useCallback } from "react";
import { useAppSelector } from "../../../hooks/reduxHooks";
import styles from "./DecisionOverlay.module.css";

interface DecisionOverlayProps {
    decisionCb: (theirIndex: number, decision: "hit" | "stand" | "doubleDown") => void;
    currentBet: number;
    theirIndex: number;
}

const DecisionOverlay: React.FC<DecisionOverlayProps> = ({ decisionCb, currentBet, theirIndex }) => {
    const userBalance = useAppSelector(state => state.user.balance);
    const canDoubleDown = userBalance - currentBet >= 0;
    const makeDecision = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
        switch (e.currentTarget.id) {
            case "decision-hit":
                decisionCb(theirIndex, "hit");
                break;
            case "decision-stand":
                decisionCb(theirIndex, "stand");
                break;
            case "decision-doubledown":
                if (canDoubleDown) { decisionCb(theirIndex, "doubleDown"); }
                break;
        }
    }, [canDoubleDown, decisionCb, theirIndex]);

    return (
        <div className={styles.decisionOverlay}>
            <h2>MAKE YOUR DECISION</h2>
            <section className={styles.buttonsWrapper}>
                <div className={styles.singleButton} aria-disabled={!canDoubleDown}>
                    <button
                        id="decision-doubledown"
                        onClick={makeDecision}
                        disabled={!canDoubleDown}
                        className={`${styles.decisionBtn} ${styles.doubleDownBtn}`}
                    >2x
                    </button>
                    <p>DOUBLE<br /> DOWN</p>
                </div>
                <div className={styles.singleButton}>
                    <button
                        id="decision-hit"
                        onClick={makeDecision}
                        className={`${styles.decisionBtn} ${styles.hitBtn}`}
                    >
                        +
                    </button>
                    <p>HIT</p>
                </div>
                <div className={styles.singleButton}>
                    <button
                        id="decision-stand"
                        onClick={makeDecision}
                        className={`${styles.decisionBtn} ${styles.standBtn}`}
                    > &minus;
                    </button>
                    <p>STAND</p>
                </div>
            </section>
        </div>
    );
};

export { DecisionOverlay };
