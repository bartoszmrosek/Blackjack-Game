import React, { useCallback } from "react";
import { useAppSelector } from "../../../hooks/reduxHooks";
import { Player } from "../../../types/Player";
import { RoundPlayer } from "../../../types/RoundPlayer";
import { CardsSpriteLoader } from "../../CardsSpriteLoader/CardsSpriteLoader";
import { PrimaryChip } from "../../ChipSvgs/PrimaryChip";
import { QuaternaryChip } from "../../ChipSvgs/QuaternaryChip";
import { QuinaryChip } from "../../ChipSvgs/QuinaryChip";
import { SecondaryChip } from "../../ChipSvgs/SecondaryChip";
import { SenaryChip } from "../../ChipSvgs/SenaryChip";
import { TertiaryChip } from "../../ChipSvgs/TertiaryChip";
import { StatusVisualizer } from "./StatusVisualizer/StatusVisualizer";
import styles from "./UserSeat.module.css";

interface UserSeatProps {
    isEmpty: boolean;
    isGameStarted: boolean;
    isCurrentlyDeciding: boolean;
    seatId: number;
    user: Player;
    actions: {
        userJoin: (seatId: number) => void;
        userLeave: (player: Player) => void;
        userChgBet: (player: Player) => void;
    };
    playerStatus: {
        cards: string[];
        status: RoundPlayer["currentStatus"];
        scorePermutations: number[];
    } | null;
}

const UserSeat: React.FC<UserSeatProps> = ({ isEmpty, user, actions, seatId, isGameStarted, playerStatus, isCurrentlyDeciding }) => {
    const currentUser = useAppSelector((state) => state.user);

    const handleJoin = useCallback(() => {
        actions.userJoin(seatId);
    }, [actions, seatId]);

    const handleLeave = useCallback(() => {
        actions.userLeave({ ...user, seatNumber: seatId });
    }, [actions, seatId, user]);

    const handleBetChg = useCallback(() => {
        if (!isGameStarted) {
            actions.userChgBet(user);
        }
    }, [actions, isGameStarted, user]);

    const pickBetChip = useCallback(() => {
        const betValue = user.bet.currentBet;
        if (betValue !== 0) {
            if (betValue < 5) {
                return <PrimaryChip overWriteNumber={betValue} />;
            }
            if (betValue < 10) {
                return <SecondaryChip overWriteNumber={betValue} />;
            }
            if (betValue < 25) {
                return <TertiaryChip overWriteNumber={betValue} />;
            }
            if (betValue < 100) {
                return <QuaternaryChip overWriteNumber={betValue} />;
            }
            if (betValue < 500) {
                return <QuinaryChip overWriteNumber={betValue} />;
            }
            return <SenaryChip overWriteNumber={betValue} />;
        }
        return null;
    }, [user.bet.currentBet]);
    const PickedChip = pickBetChip();

    return isEmpty ? (
        <button
            onClick={handleJoin}
            className={`${styles.joinBtn}`}
            disabled={currentUser.balance <= 0}
        >
            {
                currentUser.balance <= 0 ? "No funds left" :
                    isGameStarted ? "Join in next round" : "Join now"
            }
        </button>
    ) : (
        <div className={`${styles.activePlayer}`}>
            {playerStatus && (
                <div className={styles.cardsWrapper} data-testid={`cards-for-${seatId}`}>
                    {playerStatus.cards.map((card, index) => (
                        <CardsSpriteLoader
                    // eslint-disable-next-line react/no-array-index-key
                            key={index}
                            cardId={card}
                            styles={{ transform: `translate(${index * 30}%, -${index * 30}%)` }}
                            classNames={styles.singleCard}
                        />
                    ),
                    )}
                    <div className={styles.cardsInformations}>
                        <StatusVisualizer status={playerStatus.status} />
                        <span
                            className={`${styles.cardsScore} ${isCurrentlyDeciding ? styles.scoreDeciding : null}`}
                            data-testid={`is-deciding ${user.seatNumber} ${isCurrentlyDeciding}`}
                        >
                            {playerStatus.scorePermutations.filter((score, index) => {
                                if (index === 0 || score <= 21) { return true; }
                                return false;
                            }).join("/")}
                        </span>
                    </div>
                </div>
            )}
            <div className={`${styles.pickedChip} ${isCurrentlyDeciding ? styles.chipCurrentlyDeciding : null}`} onClick={handleBetChg}>
                {PickedChip}
            </div>
            <div className={styles.playerWrapper}>
                <h1 className={styles.playerName}>{user.name}</h1>
                {currentUser.id === user.id && !isGameStarted && (
                    <button
                        onClick={handleLeave}
                        className={styles.leaveBtn}
                    >
                        ×
                    </button>
                )}
            </div>
        </div>
    );
};

export { UserSeat };
