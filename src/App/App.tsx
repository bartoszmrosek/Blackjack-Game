import React from "react";
import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom";
import { RoomLoader } from "../components/RoomComponents/RoomLoader/RoomLoader";
import { Credits } from "../pages/Credits/Credits";
import { Home } from "../pages/Home/Home";
import "./App.module.css";
import { Login } from "../pages/UserOps/Login/Login";
import { Register } from "../pages/UserOps/Register/Register";
import { Logout } from "../pages/UserOps/Logout/Logout";
import { Rooms } from "../pages/Rooms/Rooms";
import { SocketContextProvider } from "../Contexts/SocketContext";
import { AuthError } from "../pages/UserOps/AuthError/AuthError";
import { RequireAuth } from "./RequireAuth";
import { AutoLoginWrapper } from "../components/AutoLoginWrapper/AutoLoginWrapper";

const OfflineGameRoom = React.lazy(() => import("../pages/GameRooms/OfflineGameRoom/OfflineGameRoom")
    .then(module => ({ default: module.OfflineGameRoom })));
const OnlineGameRoom = React.lazy(() => import("../pages/GameRooms/OnlineGameRoom/OnlineGameRoom")
    .then(module => ({ default: module.OnlineGameRoom })));

const router = createBrowserRouter(
    [
        {
            element: <AutoLoginWrapper />,
            children: [
                {
                    path: "/",
                    element: <Home />,
                },
                {
                    path: "/login",
                    element: <Login />,
                },
                {
                    path: "/register",
                    element: <Register />,
                },
                {
                    path: "/logout",
                    element: <Logout />,
                },
                {
                    path: "/autherror",
                    element: <AuthError />,
                },
                {
                    path: "/rooms",
                    element: <Rooms />,
                },
                {
                    path: "/rooms/offline",
                    element: <React.Suspense fallback={<RoomLoader />}><OfflineGameRoom /></React.Suspense>,
                },
                {
                    path: "/rooms/:roomId",
                    element: <SocketContextProvider><Outlet /></SocketContextProvider>,
                    children: [
                        {
                            index: true,
                            element:
    <RequireAuth redirectTo="/autherror">
        <React.Suspense fallback={<RoomLoader />}>
            <OnlineGameRoom />
        </React.Suspense>
    </RequireAuth>,
                        },
                    ],
                },
                {
                    path: "/credits",
                    element: <Credits />,
                },
            ],
        }], { basename: "/Blackjack-Game" });

export const App: React.FC = () => {
    return (
        <RouterProvider router={router} />
    );
};
