import React, { useCallback } from "react";
import { SwitchTransition, CSSTransition } from "react-transition-group";
import { v4 as uuidv4 } from "uuid";
import { useAppSelector } from "../../../hooks/reduxHooks";
import styles from "./DecisionOverlay.module.css";

interface DecisionOverlayProps {
    decisionCb: (decision: "hit" | "stand" | "doubleDown", theirIndex?: number) => void;
    currentBet: number;
    theirIndex?: number;
    isInOnlineMode: boolean;
}

const DecisionOverlay: React.FC<DecisionOverlayProps> = ({ decisionCb, currentBet, theirIndex, isInOnlineMode }) => {
    const userBalance = useAppSelector(state => isInOnlineMode ? state.onlineUser.balance : state.offlineUser.balance);
    const canDoubleDown = userBalance - currentBet >= 0;
    const makeDecision = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
        switch (e.currentTarget.id) {
            case "decision-hit":
                decisionCb("hit", theirIndex);
                break;
            case "decision-stand":
                decisionCb("stand", theirIndex);
                break;
            case "decision-doubledown":
                if (canDoubleDown) { decisionCb("doubleDown", theirIndex); }
                break;
        }
    }, [canDoubleDown, decisionCb, theirIndex]);
    const randomKey = uuidv4();

    return (
        <SwitchTransition mode="out-in">
            <CSSTransition
                key={randomKey}
                timeout={500}
                classNames={{
                    enter: styles.enter,
                    enterActive: styles.entering,
                    exit: styles.exit,
                    exitActive: styles.exiting,
                }}
            >
                <div className={styles.decisionOverlay}>
                    <div className={styles.contentContainer}>
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
                                >&minus;
                                </button>
                                <p>STAND</p>
                            </div>
                        </section>
                    </div>
                </div>
            </CSSTransition>
        </SwitchTransition>
    );
};

export { DecisionOverlay };
