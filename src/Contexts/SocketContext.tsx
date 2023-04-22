import React, { PropsWithChildren, createContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";
import { TypedSocket } from "../types/Socket.interfaces";
import { useAppSelector } from "../hooks/reduxHooks";

const SocketContext = createContext<TypedSocket | null>(null);

const SocketContextProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const [socket, setSocket] = useState<TypedSocket | null>(null);
    const navigate = useNavigate();
    const isOnlineUserLogged = useAppSelector(state => state.onlineUser.id) !== -1;

    useEffect(() => {
        let timeout: NodeJS.Timeout;
        if (isOnlineUserLogged) {
            const newSocket = io("http://localhost:5678/", { withCredentials: true });
            setSocket(newSocket);
            newSocket.once("connect_error", (err) => {
                console.log(err);
                setSocket(null);
                timeout = setTimeout(() => {
                    navigate("/autherror", { replace: true });
                }, 2000);
            });
        } else if (socket !== null) { socket?.disconnect(); }
        return () => clearTimeout(timeout);
    }, [isOnlineUserLogged, navigate]);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};

export { SocketContext, SocketContextProvider };
