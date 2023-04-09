import React, { useCallback, useState } from "react";
import { Player } from "../../../types/Player";
import { BetSpriteLoader } from "../../BetSpriteLoader/BetSpriteLoader";
import styles from "./BetOverlay.module.css";

interface BetOverlayProps {
    playerInformations: Player[];
    updateBet: (player: Player) => void;
    undoHandler: (player: Player) => void;
}

const BetOverlay: React.FC<BetOverlayProps> = ({ playerInformations, updateBet, undoHandler }) => {
    const [canRepeat, setCanRepeat] = useState<boolean>(
        playerInformations[0].bet.currentBet === 0 &&
        playerInformations[0].bet.previousBet !== 0);

    const buttonHandler = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
        const betAmount = parseInt(event.currentTarget.id.split("-")[1], 10);
        if (betAmount > 0 && betAmount <= 1000 && !Number.isNaN(betAmount)) {
            updateBet({ ...playerInformations[0], bet: { previousBet: playerInformations[0].bet.currentBet, currentBet: betAmount } });
        }
    }, [playerInformations, updateBet]);

    const handleSpecialBtn = useCallback(() => {
        if (canRepeat) {
            setCanRepeat(false);
            updateBet({
                ...playerInformations[0],
                bet: { previousBet: playerInformations[0].bet.currentBet, currentBet: playerInformations[0].bet.previousBet },
            });
        } else {
            updateBet({
                ...playerInformations[0],
                bet: { previousBet: playerInformations[0].bet.currentBet, currentBet: 2 * playerInformations[0].bet.currentBet },
            });
        }
    }, [canRepeat, playerInformations, updateBet]);

    const handleUndoButton = useCallback(() => {
        undoHandler(playerInformations[0]);
    }, [playerInformations, undoHandler]);

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
                    <BetSpriteLoader height="70px" width="70px" type="bet-1" />
                </button>
                <button onClick={buttonHandler} id="bet-5" className={`${styles.betButton} ${styles.betOperations}`}>
                    <BetSpriteLoader height="70px" width="70px" type="bet-5" />
                </button>
                <button onClick={buttonHandler} id="bet-10" className={`${styles.betButton} ${styles.betOperations}`}>
                    <BetSpriteLoader height="70px" width="70px" type="bet-10" />
                </button>
                <button onClick={buttonHandler} id="bet-25" className={`${styles.betButton} ${styles.betOperations}`}>
                    <BetSpriteLoader height="70px" width="70px" type="bet-25" />
                </button>
                <button onClick={buttonHandler} id="bet-100" className={`${styles.betButton} ${styles.betOperations}`}>
                    <BetSpriteLoader height="70px" width="70px" type="bet-100" />
                </button>
                <button onClick={buttonHandler} id="bet-500" className={`${styles.betButton} ${styles.betOperations}`}>
                    <BetSpriteLoader height="70px" width="70px" type="bet-500" />
                </button>
                <div className={`${styles.betOperations} ${styles.additionalTextWrapper}`}>
                    <button
                        className={`${styles.specialBtn} ${canRepeat && styles.repeatBtnWrapper}`}
                        onClick={handleSpecialBtn}
                        disabled={!playerInformations[0].bet.previousBet && !playerInformations[0].bet.currentBet}
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
