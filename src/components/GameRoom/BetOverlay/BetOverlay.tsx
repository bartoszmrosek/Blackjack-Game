import React, { useCallback, useEffect, useState } from "react";
import { Player } from "../../../types/Player";
import { PrimaryChip } from "../../ChipSvgs/PrimaryChip";
import { QuaternaryChip } from "../../ChipSvgs/QuaternaryChip";
import { QuinaryChip } from "../../ChipSvgs/QuinaryChip";
import { SecondaryChip } from "../../ChipSvgs/SecondaryChip";
import { SenaryChip } from "../../ChipSvgs/SenaryChip";
import { TertiaryChip } from "../../ChipSvgs/TertiaryChip";
import styles from "./BetOverlay.module.css";

interface BetOverlayProps {
    playerInformations: Player;
    updateBet: (player: Player) => void;
    undoHandler: (player: Player) => void;
}

const BetOverlay: React.FC<BetOverlayProps> = ({ playerInformations, updateBet, undoHandler }) => {
    const [canRepeat, setCanRepeat] = useState<boolean>(
        playerInformations.bet.currentBet === 0 &&
        playerInformations.bet.previousBet !== 0);

    const buttonHandler = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
        const betAmount = parseInt(event.currentTarget.id.split("-")[1], 10);
        if (betAmount > 0 && betAmount <= 1000 && !Number.isNaN(betAmount)) {
            updateBet({ ...playerInformations, bet: { previousBet: playerInformations.bet.currentBet, currentBet: betAmount } });
        }
    }, [playerInformations, updateBet]);

    const handleSpecialBtn = useCallback(() => {
        if (canRepeat) {
            updateBet({
                ...playerInformations,
                bet: { previousBet: playerInformations.bet.currentBet, currentBet: playerInformations.bet.previousBet },
            });
        } else {
            updateBet({
                ...playerInformations,
                bet: { previousBet: playerInformations.bet.currentBet, currentBet: 2 * playerInformations.bet.currentBet },
            });
        }
    }, [canRepeat, playerInformations, updateBet]);

    const handleUndoButton = useCallback(() => {
        undoHandler(playerInformations);
    }, [playerInformations, undoHandler]);

    useEffect(() => {
        setCanRepeat((
            playerInformations.bet.currentBet === 0 &&
                playerInformations.bet.previousBet !== 0));
    }, [playerInformations]);

    return (
        <div className={styles.overlayWrapper}>
            <>
                <div className={`${styles.betOperations} ${styles.additionalTextWrapper}`}>
                    <span className={styles.additionalText}>UNDO</span>
                    <button onClick={handleUndoButton} className={styles.undoButton}>
                        <img height="40px" width="40px" src="./Graphics/undo.svg" alt="Undo button" />
                    </button>
                </div>
                <button onClick={buttonHandler} id="bet-1" className={`${styles.betButton} ${styles.betOperations}`}>
                    <PrimaryChip />
                </button>
                <button onClick={buttonHandler} id="bet-5" className={`${styles.betButton} ${styles.betOperations}`}>
                    <SecondaryChip />
                </button>
                <button onClick={buttonHandler} id="bet-10" className={`${styles.betButton} ${styles.betOperations}`}>
                    <TertiaryChip />
                </button>
                <button onClick={buttonHandler} id="bet-25" className={`${styles.betButton} ${styles.betOperations}`}>
                    <QuaternaryChip />
                </button>
                <button onClick={buttonHandler} id="bet-100" className={`${styles.betButton} ${styles.betOperations}`}>
                    <QuinaryChip />
                </button>
                <button onClick={buttonHandler} id="bet-500" className={`${styles.betButton} ${styles.betOperations}`}>
                    <SenaryChip />
                </button>
                <div className={`${styles.betOperations} ${styles.additionalTextWrapper}`}>
                    <button
                        className={`${styles.specialBtn} ${canRepeat && styles.repeatBtnWrapper}`}
                        onClick={handleSpecialBtn}
                        disabled={!playerInformations.bet.previousBet && !playerInformations.bet.currentBet}
                    >
                        {canRepeat ? (
                            <img
                                src="./Graphics/repeat.svg"
                                width="40px"
                                height="40px"
                                className={styles.repeatBtn}
                                alt="Repeat icon"
                            />
                        ) :
                            <span>2x</span>}
                    </button>
                    <span className={styles.additionalText}>{canRepeat ? "REPEAT" : "DOUBLE"}</span>
                </div>
            </>
        </div>
    );
};

export { BetOverlay };
