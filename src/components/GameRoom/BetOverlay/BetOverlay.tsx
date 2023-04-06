import React, { useCallback, useState } from "react";
import { useAppSelector } from "../../../hooks/reduxHooks";
import { Player } from "../gameRoomReducer";
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
    const userBalance = useAppSelector(state => state.user.balance);

    const buttonHandler = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
        const betAmount = parseInt(event.currentTarget.innerText, 10);
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
            {userBalance > 0 ? (
                <>
                    <button onClick={handleUndoButton}>Undo</button>
                    <button onClick={buttonHandler}>1</button>
                    <button onClick={buttonHandler}>5</button>
                    <button onClick={buttonHandler}>10</button>
                    <button onClick={buttonHandler}>25</button>
                    <button onClick={buttonHandler}>100</button>
                    <button onClick={buttonHandler}>500</button>
                    <button
                        onClick={handleSpecialBtn}
                        disabled={!playerInformations[0].bet.previousBet && !playerInformations[0].bet.currentBet}
                    >{canRepeat ? "Repeat" : "2x"}
                    </button>
                </>
            ) : <p>No funds left</p>}
        </div>
    );
};

export { BetOverlay };
