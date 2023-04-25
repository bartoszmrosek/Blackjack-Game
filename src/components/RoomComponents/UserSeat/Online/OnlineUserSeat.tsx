import React, { CSSProperties, useCallback } from "react";
import { useAppSelector } from "../../../../hooks/reduxHooks";
import { OnlineActivePlayer, OnlinePendingPlayer } from "../../../../types/Player.interface";
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
    user: OnlinePendingPlayer | OnlineActivePlayer | null;
    actions: {
        userJoin: (seatId: number) => void;
        userLeave: (seatId: number) => void;
        userChgBet: (seatBet: { bet: number; seatId: number; previousBet: number; }) => void;
    };
}

const OnlineUserSeat: React.FC<UserSeatProps> = ({ isEmpty, user, actions, seatId, isGameStarted, isCurrentlyDeciding }) => {
    const currentUser = useAppSelector((state) => state.onlineUser);

    const handleJoin = useCallback(() => {
        actions.userJoin(seatId);
    }, [actions, seatId]);

    const handleLeave = useCallback(() => {
        if (user !== null) {
            actions.userLeave(user.seatId);
        }
    }, [actions, user]);

    const handleBetChg = useCallback(() => {
        if (user !== null && user.userId === currentUser.id) {
            actions.userChgBet({ seatId: user.seatId, bet: user.bet, previousBet: user.previousBet });
        }
    }, [actions, currentUser.id, user]);

    const pickBetChip = useCallback(() => {
        if (user === null) { return null; }
        const betValue = user.bet;
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
    }, [user]);
    const PickedChip = pickBetChip();

    return isEmpty ? (
        <div className={styles.joinBtnWrapper}>
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
        </div>
    ) : (
        <div className={`${styles.activePlayer}`} data-testid="active-player">
            {user !== null && "status" in user && (
                <div className={styles.cardsWrapper} data-testid={`cards-for-${seatId}`}>
                    {user.cards.map((card, index) => {
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
                        <StatusVisualizer status={user.status} />
                        <span
                            className={`${styles.cardsScore} ${isCurrentlyDeciding ? styles.scoreDeciding : null}`}
                            data-testid={`is-deciding ${user.seatId} ${isCurrentlyDeciding}`}
                        >
                            {user.cardsScore.filter((score, index) => {
                                if (index === 0 || score <= 21) { return true; }
                                return false;
                            }).join("/")}
                        </span>
                    </div>
                </div>
            )}
            <div
                className={`
                ${styles.pickedChip}
                 ${isCurrentlyDeciding ? styles.chipCurrentlyDeciding : null}
                  ${user === null || user.userId !== currentUser.id ? styles.chipDisabled : null}`}
                onClick={handleBetChg}
                data-testid="chip-in-betting"
            >
                {PickedChip}
            </div>
            {user !== null && (
                <div className={styles.playerWrapper}>
                    <h1 className={styles.playerName}>{user.username}</h1>
                    {currentUser.id === user.userId && !isGameStarted && (
                        <button
                            onClick={handleLeave}
                            className={styles.leaveBtn}
                        >
                            ×
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export { OnlineUserSeat };
