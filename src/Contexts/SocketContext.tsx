import React, { PropsWithChildren, createContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";
import { TypedSocket } from "../types/Socket.interfaces";
import { useAppSelector } from "../hooks/reduxHooks";

const SocketContext = createContext<TypedSocket | null>(null);
const serverURL = import.meta.env.PROD ? "https://blackjackapi-rpoa.onrender.com/" : `${import.meta.env.VITE_DEV_HOST}/`;

const SocketContextProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const [socket, setSocket] = useState<TypedSocket | null>(null);
    const navigate = useNavigate();
    const isOnlineUserLogged = useAppSelector(state => state.onlineUser.id) !== -1;

    useEffect(() => {
        let timeout: NodeJS.Timeout;
        if (isOnlineUserLogged) {
            if (socket === null) {
                const newSocket = io(serverURL, { withCredentials: true });
                setSocket(newSocket);
                newSocket.once("connect_error", (err) => {
                    console.log(`Auth error: ${err}`);
                    setSocket(null);
                    navigate("/autherror", { replace: true });
                });
            }
        } else if (socket !== null) { socket?.disconnect(); }
        return () => {
            socket?.disconnect();
            clearTimeout(timeout);
        };
    }, [isOnlineUserLogged, navigate, socket]);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};

export { SocketContext, SocketContextProvider };
