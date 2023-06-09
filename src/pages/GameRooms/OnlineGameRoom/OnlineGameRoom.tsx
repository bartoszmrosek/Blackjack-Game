import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import styles from "../GameRoom.module.css";
import { GoBackButton } from "../../../components/Overlays/GoBackButton/GoBackButton";
import { BalanceInformations } from "../../../components/Overlays/BalanceInformations/BalanceInformations";
import { UserInformations } from "../../../components/Overlays/UserInformations/UserInformations";
import { useAppDispatch, useAppSelector } from "../../../hooks/reduxHooks";
import { useSocket } from "../../../hooks/useSocket";
import { RoomLoader } from "../../../components/RoomComponents/RoomLoader/RoomLoader";
import { ImportantMessage } from "../../../components/RoomComponents/ImportantMessage/ImportantMessage";
import {
    OnlinePresenterSection,
} from "../../../components/RoomComponents/PresenterSection/Online/OnlinePresenterSection";
import { OnlineUserSeat } from "../../../components/RoomComponents/UserSeat/Online/OnlineUserSeat";
import { OnlineBetOverlay } from "../../../components/RoomComponents/BetOverlay/Online/OnlineBetOverlay";
import { loginOnlineUser, updateBalance } from "../../../App/onlineUserSlice";
import { PlayerBets } from "../../../types/Player.interface";
import { DecisionOverlay } from "../../../components/RoomComponents/DecisionOverlay/DecisionOverlay";
import { Timer } from "../../../components/Overlays/Timer/Timer";
import { useSize } from "../../../hooks/useSize";
import { MovingArrows } from "../../../components/RoomComponents/MovingArrows/MovingArrows";

const pickMessageFromCode = (code: number): string => {
    switch (code) {
        case 404:
            return "Room not found";
        case 409:
            return "Room is full";
        case 429:
            return "Too many requests";
        case 200:
            return "Successfully joined!";
        default:
            return "Unknown error";
    }
};

const OnlineGameRoom: React.FC = () => {
    const { roomId } = useParams();
    const [isConnecting, setIsConnecting] = useState(true);
    const [seatBetsToUpdate, setSeatBetsToUpdate] = useState<{ seatId: number; previousBet: number; bet: number; }[]>([]);
    const [connStatus, setConnStatus] = useState(0);
    const [actionMessage, setActionMessage] = useState("");
    const navigate = useNavigate();
    const [movingController, setMovingController] = useState(2);
    const { width } = useSize();
    const onlineUser = useAppSelector(state => state.onlineUser);
    const onlineUserDispatch = useAppDispatch();

    const updateBets = useCallback((bets: PlayerBets[]) => setSeatBetsToUpdate(bets), []);

    const { socket, timer, seats, gameState, currentlyAsking, additionalMessage, presenterState } =
     useSocket(onlineUser.id, updateBets);

    useEffect(() => {
        if (roomId) {
            socket?.emit("joinGameTable", roomId, (status, userOnServer) => {
                setConnStatus(status);
                setIsConnecting(false);
                if (status === 200 && userOnServer && onlineUser.id !== userOnServer.userId) {
                    onlineUserDispatch(loginOnlineUser({
                        id: userOnServer.userId,
                        balance: userOnServer.balance,
                        username: userOnServer.username,
                    }));
                }
            });
        } else {
            setIsConnecting(false);
            setConnStatus(404);
        }
    }, [onlineUser.id, onlineUserDispatch, roomId, socket]);

    useEffect(() => {
        let statusTimeout: NodeJS.Timeout;
        if (connStatus !== 0) {
            statusTimeout = setTimeout(() => {
                setConnStatus(0);
                if (connStatus === 404) {
                    navigate("/rooms");
                }
            }, 5000);
        }
        return () => clearTimeout(statusTimeout);
    }, [connStatus, navigate]);

    useEffect(() => {
        let actionTimeout: NodeJS.Timeout;
        if (actionMessage) {
            actionTimeout = setTimeout(() => {
                setActionMessage("");
            }, 5000);
        }
        return () => clearTimeout(actionTimeout);
    }, [actionMessage]);

    const addSeatToUpdateBet = useCallback((seatBet: PlayerBets) => {
        if (!seatBetsToUpdate.some((queuedSeatId) => queuedSeatId.seatId === seatBet.seatId)) {
            setSeatBetsToUpdate(prev => [...prev, seatBet]);
        }
    }, [seatBetsToUpdate]);

    const tryJoiningToSeat = useCallback((seatId: number) => {
        if (socket !== null) {
            socket.emit("joinTableSeat", seatId, (ack) => {
                if (ack === 406) {
                    return setActionMessage("Seat already occupied");
                }
                addSeatToUpdateBet({ bet: 0, previousBet: 0, seatId });
            });
        }
    }, [addSeatToUpdateBet, socket]);

    const trySettingSeatBet = useCallback((seatId: number, bet: number) => {
        if (socket !== null) {
            setSeatBetsToUpdate(prev => prev.filter((updatedBet) => updatedBet.seatId !== seatId));
            socket.emit("placeBet", bet, seatId, (ack, newBalance) => {
                if (newBalance) { onlineUserDispatch(updateBalance(newBalance)); }
                if (ack === 200) { return setActionMessage("Bet accepted"); }
                return setActionMessage("Bet was not accepted");
            });
        }
    }, [onlineUserDispatch, socket]);

    const tryLeavingSeat = useCallback((seatId: number, leaveFromUpdateBets?: boolean) => {
        if (socket !== null) {
            socket.emit("leaveTableSeat", seatId);
            if (leaveFromUpdateBets) {
                setSeatBetsToUpdate((prev) => prev.filter((seat) => seat.seatId !== seatId));
            }
        }
    }, [socket]);

    const moveRightConrol = useCallback(() => {
        setMovingController(prev => {
            if (prev + 1 < 5) {
                return prev + 1;
            }
            return prev;
        });
    }, []);

    const moveLeftControl = useCallback(() => {
        setMovingController(prev => {
            if (prev - 1 >= 0) {
                return prev - 1;
            }
            return prev;
        });
    }, []);

    useEffect(() => {
        if (currentlyAsking !== null) {
            setMovingController(currentlyAsking.seatId);
        }
    }, [currentlyAsking]);

    // This is repair for "flickering" when react transition props was used and was not unique when needed
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const decisionAnimationKey = useMemo(() => ({ key: uuidv4() }), [currentlyAsking]);

    const askingSeat = currentlyAsking ? seats[currentlyAsking.seatId] : null;
    const userSeatWidth = width >= 920 ? 30 : 50;
    const defaultTranslate = width >= 920 ? 35 : 25;

    return (
        <main className={styles.onlineGameRoomWrapper}>
            {isConnecting ? <RoomLoader /> : (
                <>
                    <OnlinePresenterSection presenter={presenterState} />
                    <div
                        className={styles.userSeats}
                        style={
                        {
                            transform: width < 1320 ? `translate(${defaultTranslate - movingController * userSeatWidth}vw)` : "",
                        }}
                    >
                        {seats.map((seat, index) => {
                            const user = seat === "empty" ? null : seat;
                            return (
                                <OnlineUserSeat
                                // eslint-disable-next-line react/no-array-index-key
                                    key={index}
                                    isEmpty={seat === "empty"}
                                    isGameStarted={gameState.isGameStarted}
                                    isCurrentlyDeciding={
                                        seat !== "empty" && currentlyAsking !== null && seat.seatId === currentlyAsking.seatId
                                    }
                                    seatId={index}
                                    user={user}
                                    actions={{
                                        userJoin: tryJoiningToSeat,
                                        userChgBet: addSeatToUpdateBet,
                                        userLeave: tryLeavingSeat,
                                    }}
                                />
                            );
                        })}
                    </div>
                    {connStatus === 0 && actionMessage && <ImportantMessage message={actionMessage} />}
                    {connStatus === 0 && !actionMessage && additionalMessage && <ImportantMessage message={additionalMessage} />}
                </>
            )}
            {currentlyAsking?.cb && (
                <DecisionOverlay
                    decisionCb={currentlyAsking.cb}
                    isInOnlineMode={true}
                    currentBet={askingSeat !== "empty" && askingSeat !== null ? askingSeat.bet : 0}
                    customAnimationKey={decisionAnimationKey.key}
                />
            )}
            {seatBetsToUpdate.length !== 0 && (
                <OnlineBetOverlay
                    playerInformations={seatBetsToUpdate[0]}
                    updateBet={trySettingSeatBet}
                    undoHandler={tryLeavingSeat}
                />
            )}
            {connStatus !== 0 && <ImportantMessage message={pickMessageFromCode(connStatus)} />}
            <UserInformations username={onlineUser.username} />
            {width < 650 && timer.message ? null : (
                <Timer
                    maxTime={timer.time / 1000 === 1000 ? 0 : timer.time / 1000}
                    descriptionOverwrite={timer.message}
                />
            )}
            <BalanceInformations
                currentBalance={onlineUser.balance}
                shouldDisplayBets={true}
                totalInBets={seats.reduce((acc, seat) => {
                    if (seat !== "empty" && seat.userId === onlineUser.id) {
                        return acc + seat.bet;
                    }
                    return acc;
                }, 0)}
            />
            {width < 1320 && (
                <MovingArrows
                    nextCallback={moveRightConrol}
                    previousCallback={moveLeftControl}
                    isNextPossible={movingController + 1 < 5}
                    isPrevPossible={movingController - 1 >= 0}
                />
            )}
            <GoBackButton />
        </main>
    );
};

export { OnlineGameRoom };
