import React, { PropsWithChildren } from "react";
import { Navigate } from "react-router-dom";
import { useAppSelector } from "../hooks/reduxHooks";

interface RequireAuthProps {
    redirectTo: string;
}

const RequireAuth: React.FC<PropsWithChildren & RequireAuthProps> = ({ children, redirectTo }) => {
    const isUserLoggedIn = useAppSelector(state => state.onlineUser.id) !== -1;
    return isUserLoggedIn ? <>{children}</> : <Navigate to={redirectTo} />;
};

export { RequireAuth };
