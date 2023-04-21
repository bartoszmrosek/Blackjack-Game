import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { RoomLoader } from "../components/RoomComponents/RoomLoader/RoomLoader";
import { Credits } from "../pages/Credits/Credits";
import { Home } from "../pages/Home/Home";
import "./App.module.css";
import { Login } from "../pages/UserOps/Login/Login";
import { Register } from "../pages/UserOps/Register/Register";
import { Logout } from "../pages/UserOps/Logout/Logout";

const OfflineGameRoom = React.lazy(() => import("../pages/OfflineGameRoom/OfflineGameRoom")
    .then(module => ({ default: module.OfflineGameRoom })));

const router = createBrowserRouter([
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
        path: "/rooms/offline",
        element: <React.Suspense fallback={<RoomLoader />}><OfflineGameRoom /></React.Suspense>,
    },
    {
        path: "/credits",
        element: <Credits />,
    },
], { basename: "/Blackjack-Game" });

export const App: React.FC = () => {
    return (
        <RouterProvider router={router} />
    );
};
