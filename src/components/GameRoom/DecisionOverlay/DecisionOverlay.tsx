import React, { useCallback } from "react";
import { useAppSelector } from "../../../hooks/reduxHooks";
import styles from "./DecisionOverlay.module.css";

interface DecisionOverlayProps {
    decisionCb: (theirIndex: number, decision: "hit" | "stand" | "doubleDown") => void;
    presenterScore: number;
    playerScore: number | undefined;
    currentBet: number;
    theirIndex: number;
}

const DecisionOverlay: React.FC<DecisionOverlayProps> = ({ decisionCb, presenterScore, playerScore, currentBet, theirIndex }) => {
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
            <p>My score: {playerScore}</p>
            <p>Presenter score: {presenterScore}</p>
            <button id="decision-hit" onClick={makeDecision}>Hit</button>
            <button id="decision-stand" onClick={makeDecision}>Stand</button>
            <button id="decision-doubledown" onClick={makeDecision} disabled={!canDoubleDown}>Doubledown</button>
        </div>
    );
};

export { DecisionOverlay };
