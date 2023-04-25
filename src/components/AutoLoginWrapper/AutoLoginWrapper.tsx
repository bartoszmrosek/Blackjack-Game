import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useFetch } from "../../hooks/useFetch";
import { useAppDispatch } from "../../hooks/reduxHooks";
import { loginOnlineUser } from "../../App/onlineUserSlice";

const AutoLoginWrapper: React.FC = () => {
    const [, status, userData] = useFetch<{ username: string; id: number; balance: number; }>("/login/token", "GET", true, true, true);
    const onlineUserDispatch = useAppDispatch();

    useEffect(() => {
        if (status === 200 && userData) {
            onlineUserDispatch(loginOnlineUser({
                username: userData.username,
                id: userData.id,
                balance: userData.balance,
            }));
        }
    }, [onlineUserDispatch, status, userData]);

    return (
        <>
            <Outlet />
        </>
    );
};

export { AutoLoginWrapper };
