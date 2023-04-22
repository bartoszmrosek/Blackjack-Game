import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import styles from "./OnlineGame.module.css";
import { GoBackButton } from "../../components/Overlays/GoBackButton/GoBackButton";
import { BalanceInformations } from "../../components/Overlays/BalanceInformations/BalanceInformations";
import { UserInformations } from "../../components/Overlays/UserInformations/UserInformations";
import { useAppSelector } from "../../hooks/reduxHooks";
import { useSocket } from "../../hooks/useSocket";
import { RoomLoader } from "../../components/RoomComponents/RoomLoader/RoomLoader";
import { ImportantMessage } from "../../components/RoomComponents/ImportantMessage/ImportantMessage";
import { PresenterSection } from "../../components/RoomComponents/PresenterSection/Online/PresenterSection";

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
    const [connStatus, setConnStatus] = useState(0);
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

    console.log(socket, timer, seats, gameState, currentlyAsking, additionalMessage);
    return (
        <main className={styles.onlineGameRoomWrapper}>
            {isConnecting ? <RoomLoader /> : (
                <>
                    <PresenterSection presenter={presenterState} />
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
