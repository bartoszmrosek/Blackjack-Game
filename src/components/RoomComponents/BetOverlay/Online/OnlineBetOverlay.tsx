import React, { useCallback, useEffect, useState } from "react";
import { useAppSelector } from "../../../../hooks/reduxHooks";
import { PrimaryChip } from "../../../ChipSvgs/PrimaryChip";
import { QuaternaryChip } from "../../../ChipSvgs/QuaternaryChip";
import { QuinaryChip } from "../../../ChipSvgs/QuinaryChip";
import { SecondaryChip } from "../../../ChipSvgs/SecondaryChip";
import { SenaryChip } from "../../../ChipSvgs/SenaryChip";
import { TertiaryChip } from "../../../ChipSvgs/TertiaryChip";
import { transformImgUrl } from "../../../../utils/transformImgUrl";
import styles from "../BetOverlay.module.css";
import { PlayerBets } from "../../../../types/Player.interface";

interface BetOverlayProps {
    playerInformations: PlayerBets;
    updateBet: (seatId: number, bet: number) => void;
    undoHandler: (seatId: number) => void;
}

const OnlineBetOverlay: React.FC<BetOverlayProps> = ({ playerInformations, updateBet, undoHandler }) => {
    const [canRepeat, setCanRepeat] = useState<boolean>(
        playerInformations.bet === 0 &&
        playerInformations.previousBet !== 0);
    const currentUserBalance = useAppSelector(state => state.onlineUser.balance);

    const buttonHandler = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
        const betAmount = parseInt(event.currentTarget.id.split("-")[1], 10);
        if (betAmount > 0 && betAmount <= 1000 && !Number.isNaN(betAmount)) {
            updateBet(playerInformations.seatId, betAmount);
        }
    }, [playerInformations.seatId, updateBet]);

    const handleSpecialBtn = useCallback(() => {
        if (canRepeat) {
            updateBet(playerInformations.seatId, playerInformations.previousBet);
        } else {
            updateBet(playerInformations.seatId, playerInformations.bet * 2);
        }
    }, [canRepeat, playerInformations, updateBet]);

    const handleUndoButton = useCallback(() => {
        undoHandler(playerInformations.seatId);
    }, [playerInformations, undoHandler]);

    useEffect(() => {
        setCanRepeat((playerInformations.bet === 0 && playerInformations.previousBet !== 0));
    }, [playerInformations]);

    return (
        <div className={styles.overlayWrapper}>
            <>
                <div className={`${styles.betOperations} ${styles.additionalTextWrapper}`}>
                    <span className={styles.additionalText}>UNDO</span>
                    <button onClick={handleUndoButton} className={styles.undoButton}>
                        <img height="40px" width="40px" src={`${transformImgUrl("/Graphics/undo.svg")}`} alt="Undo button" />
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
                        disabled={
                            !playerInformations.previousBet && !playerInformations.bet
                            || (currentUserBalance - playerInformations.previousBet < 0)
                            || (currentUserBalance - playerInformations.bet < 0)
                        }
                    >
                        {canRepeat ? (
                            <img
                                src={`${transformImgUrl("/Graphics/repeat.svg")}`}
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

export { OnlineBetOverlay };
