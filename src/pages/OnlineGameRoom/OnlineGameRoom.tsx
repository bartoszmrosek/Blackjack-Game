import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import styles from "./OnlineGame.module.css";
import { GoBackButton } from "../../components/Overlays/GoBackButton/GoBackButton";
import { BalanceInformations } from "../../components/Overlays/BalanceInformations/BalanceInformations";
import { UserInformations } from "../../components/Overlays/UserInformations/UserInformations";
import { useAppSelector } from "../../hooks/reduxHooks";
import { useSocket } from "../../hooks/useSocket";

const OnlineGameRoom: React.FC = () => {
    const onlineUser = useAppSelector(state => state.onlineUser);
    const { roomId } = useParams();
    const [isConnecting, setIsConnecting] = useState(true);
    const [connStatus, setConnStatus] = useState(0);
    const { socket, timer, seats } = useSocket(onlineUser.id);

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
    }, []);

    console.log(socket, timer, seats);
    return (
        <main className={styles.onlineGameRoomWrapper}>

            {isConnecting ? "Connecting" : connStatus}
            <UserInformations username={onlineUser.username} />
            <BalanceInformations currentBalance={1000} shouldDisplayBets={true} totalInBets={50} />
            <GoBackButton />
        </main>
    );
};

export { OnlineGameRoom };
