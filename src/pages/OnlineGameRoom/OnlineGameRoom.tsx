import React, { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import styles from "./OnlineGame.module.css";
import { GoBackButton } from "../../components/Overlays/GoBackButton/GoBackButton";
import { BalanceInformations } from "../../components/Overlays/BalanceInformations/BalanceInformations";
import { UserInformations } from "../../components/Overlays/UserInformations/UserInformations";
import { useAppSelector } from "../../hooks/reduxHooks";
import { useSocket } from "../../hooks/useSocket";
import { RoomLoader } from "../../components/RoomComponents/RoomLoader/RoomLoader";
import { ImportantMessage } from "../../components/RoomComponents/ImportantMessage/ImportantMessage";
import { OnlinePresenterSection } from "../../components/RoomComponents/PresenterSection/Online/OnlinePresenterSection";
import { OnlineUserSeat } from "../../components/RoomComponents/UserSeat/Online/OnlineUserSeat";

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
    const [seatBetsToUpdate, setSeatBetsToUpdate] = useState<number[]>([]);
    const [connStatus, setConnStatus] = useState(0);
    const [actionMessage, setActionMessage] = useState("");
    const onlineUser = useAppSelector(state => state.onlineUser);
    const { socket, timer, seats, gameState, currentlyAsking, additionalMessage, presenterState } = useSocket(onlineUser.id);

    useEffect(() => {
        if (roomId) {
            socket?.emit("joinGameTable", roomId, (status) => {
                setConnStatus(status);
                setIsConnecting(false);
            });
        } else {
            setIsConnecting(false);
            setConnStatus(404);
        }
    }, [roomId, socket]);

    useEffect(() => {
        let statusTimeout: NodeJS.Timeout;
        if (connStatus !== 0) {
            statusTimeout = setTimeout(() => {
                setConnStatus(0);
            }, 5000);
        }
        return () => clearTimeout(statusTimeout);
    }, [connStatus]);

    useEffect(() => {
        let actionTimeout: NodeJS.Timeout;
        if (actionMessage) {
            actionTimeout = setTimeout(() => {
                setConnStatus(0);
            }, 5000);
        }
        return () => clearTimeout(actionTimeout);
    }, [actionMessage]);

    const tryJoiningToSeat = useCallback((seatId: number) => {
        console.log("a");
        if (socket !== null) {
            socket.emit("joinTableSeat", seatId, (ack) => {
                if (ack === 406) {
                    setActionMessage("Seat already occupied");
                }
            });
        }
    }, [socket]);

    const trySettingSeatBet = useCallback((seatId: number, bet: number) => {
        if (socket !== null) {
            setSeatBetsToUpdate(prev => prev.filter((id) => id !== seatId));
            socket.emit("placeBet", bet, seatId, (ack) => {
                if (ack === 200) { return setActionMessage("Bet accepted"); }
                return setActionMessage("Bet was not accepted");
            });
        }
    }, [socket]);

    const tryLeavingSeat = useCallback((seatId: number) => {
        if (socket !== null) {
            socket.emit("leaveTableSeat", seatId);
        }
    }, [socket]);

    const addSeatToUpdateBet = useCallback((seatId: number) => {
        if (!seatBetsToUpdate.some((queuedSeatId) => queuedSeatId === seatId)) {
            setSeatBetsToUpdate(prev => [...prev, seatId]);
        }
    }, [seatBetsToUpdate]);

    console.log(socket, timer, seats, gameState, currentlyAsking, additionalMessage);
    console.log(trySettingSeatBet);
    return (
        <main className={styles.onlineGameRoomWrapper}>
            {isConnecting ? <RoomLoader /> : (
                <>
                    <OnlinePresenterSection presenter={presenterState} />
                    <div className={styles.userSeats}>
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
                    {!connStatus && actionMessage && <ImportantMessage message={actionMessage} />}
                    {!connStatus && !actionMessage && additionalMessage && <ImportantMessage message={additionalMessage} />}
                </>
            )}
            {connStatus && <ImportantMessage message={pickMessageFromCode(connStatus)} />}
            <UserInformations username={onlineUser.username} />
            <BalanceInformations currentBalance={1000} shouldDisplayBets={true} totalInBets={50} />
            <GoBackButton />
        </main>
    );
};

export { OnlineGameRoom };
