import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { RoomLoader } from "../components/RoomComponents/RoomLoader/RoomLoader";
import { Credits } from "../pages/Credits/Credits";
import { Home } from "../pages/Home/Home";
import "./App.module.css";
import { Login } from "../pages/Login/Login";
import { Register } from "../pages/Register/Register";

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
