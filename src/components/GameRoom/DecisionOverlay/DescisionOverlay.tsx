import React, { useCallback } from "react";
import styles from "./DecisionOverlay.module.css";

interface DecisionOverlayProps {
    decisionCb: (decision: "hit" | "stand" | "doubleDown") => void;
    presenterScore: number;
    playerScore: number;
}

const DecisionOverlay: React.FC<DecisionOverlayProps> = ({ decisionCb, presenterScore, playerScore }) => {
    const makeDecision = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
        switch (e.currentTarget.id) {
            case "decision-hit":
                decisionCb("hit");
                break;
            case "decision-stand":
                decisionCb("stand");
                break;
            case "decision-doubledown":
                decisionCb("doubleDown");
                break;
        }
    }, [decisionCb]);

    return (
        <div className={styles.decisionOverlay}>
            <p>My score: {playerScore}</p>
            <p>Presenter score: {presenterScore}</p>
            <button id="decision-hit" onClick={makeDecision}>Hit</button>
            <button id="decision-stand" onClick={makeDecision}>Stand</button>
            <button id="decision-doubledown" onClick={makeDecision}>Doubledown</button>
        </div>
    );
};

export { DecisionOverlay };
