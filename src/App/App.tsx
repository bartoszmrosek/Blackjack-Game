import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { RoomLoader } from "../components/RoomComponents/RoomLoader/RoomLoader";
import { Credits } from "../pages/Credits/Credits";
import { Home } from "../pages/Home/Home";
import "./App.module.css";

const GameRoom = React.lazy(() => import("../pages/OfflineGameRoom/OfflineGameRoom").then(module => ({ default: module.GameRoom })));

const router = createBrowserRouter([
    {
        path: "/",
        element: <Home />,
    },
    {
        path: "/offline/room",
        element: <React.Suspense fallback={<RoomLoader />}><GameRoom /></React.Suspense>,
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
