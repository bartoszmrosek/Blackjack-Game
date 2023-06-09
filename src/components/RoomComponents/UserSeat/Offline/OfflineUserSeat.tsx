import React, { CSSProperties, useCallback } from "react";
import { useAppSelector } from "../../../../hooks/reduxHooks";
import { OfflinePlayer, OfflineRoundPlayer } from "../../../../types/Player.interface";
import { CardsSpriteLoader } from "../../../CardsSpriteLoader/CardsSpriteLoader";
import { PrimaryChip } from "../../../ChipSvgs/PrimaryChip";
import { QuaternaryChip } from "../../../ChipSvgs/QuaternaryChip";
import { QuinaryChip } from "../../../ChipSvgs/QuinaryChip";
import { SecondaryChip } from "../../../ChipSvgs/SecondaryChip";
import { SenaryChip } from "../../../ChipSvgs/SenaryChip";
import { TertiaryChip } from "../../../ChipSvgs/TertiaryChip";
import { StatusVisualizer } from "../StatusVisualizer/StatusVisualizer";
import styles from "../UserSeat.module.css";

interface UserSeatProps {
    isEmpty: boolean;
    isGameStarted: boolean;
    isCurrentlyDeciding: boolean;
    seatId: number;
    user: OfflinePlayer;
    actions: {
        userJoin: (seatId: number) => void;
        userLeave: (player: OfflinePlayer) => void;
        userChgBet: (player: OfflinePlayer) => void;
    };
    playerStatus: {
        cards: string[];
        status: OfflineRoundPlayer["currentStatus"];
        scorePermutations: number[];
    } | null;
}

const OffLineUserSeat: React.FC<UserSeatProps> = ({ isEmpty, user, actions, seatId, isGameStarted, playerStatus, isCurrentlyDeciding }) => {
    const currentUser = useAppSelector((state) => state.offlineUser);

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
        <div className={styles.joinBtnWrapper}>
            <button
                onClick={handleJoin}
                className={`${styles.joinBtn}`}
                disabled={currentUser.balance <= 0 || isGameStarted}
            >
                {
                currentUser.balance <= 0 ? "No funds left" :
                    isGameStarted ? "Join in next round" : "Join now"
            }
            </button>
        </div>
    ) : (
        <div className={`${styles.activePlayer}`}>
            {playerStatus && (
                <div className={styles.cardsWrapper} data-testid={`cards-for-${seatId}`}>
                    {playerStatus.cards.map((card, index) => {
                        const dynamicKeyframes = `
                            @keyframes card-appearing-in-${index} {
                                0% {opacity: 0; transform: translate(${index * 60}%, -${index * 60}%)}
                                100% {opacity: 1; transform: translate(${index * 30}%, -${index * 30}%)}
                            }
                        `;
                        const cardStyles: CSSProperties = {
                            animation: `card-appearing-in-${index} 0.75s ease-in forwards`,
                            zIndex: -10 + index,
                        };
                        return (
                            // eslint-disable-next-line react/no-array-index-key
                            <React.Fragment key={index}>
                                <style>{dynamicKeyframes}</style>
                                <CardsSpriteLoader
                                    cardId={card}
                                    styles={cardStyles}
                                    classNames={`${styles.singleCard}`}
                                />
                            </React.Fragment>
                        );
                    })
                    }
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
            <div
                className={`${styles.pickedChip} ${isCurrentlyDeciding ? styles.chipCurrentlyDeciding : null}`}
                onClick={handleBetChg}
                data-testid="chip-in-betting"
            >
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

export { OffLineUserSeat };
