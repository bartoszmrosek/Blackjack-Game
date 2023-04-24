import { Socket } from "socket.io-client";
import { OnlineActivePlayer, OnlinePendingPlayer, PlayerDecision } from "./Player.interface";

export interface GameState {
    isGameStarting: boolean;
    isGameStarted: boolean;
    isGameFinished: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type WithTimeoutAck<IsSender extends boolean, Args extends any[]> =
IsSender extends true ? [Error, ...Args] : Args;

export type GameStatusObject = {
    gameState: GameState;
    timer: number;
    activePlayers: OnlineActivePlayer[];
    pendingPlayers: OnlinePendingPlayer[];
    presenterState: { cards: string[]; score: number[]; };
    currentlyAsking: { userId: number; seatId: number; } | null;
};

export interface ServerToClienEvents<IsSender extends boolean = false> {
    gameTimerStarting: (timerTime: number) => void;
    userJoinedSeat: ({ username, userId, seatId }:
        { username: string; userId: number; seatId: number; timer: number; }
    ) => void;
    userLeftSeat: ({ userId, seatId, username }: { userId: number; seatId: number; username: string; }) => void;
    userLeftGame: (userId: number) => void;
    betPlaced: (bet: number, seatId: number, timer: number) => void;
    gameStatusUpdate: (
        {
            gameState,
            timer,
            activePlayers,
            pendingPlayers,
            presenterState,
            currentlyAsking,
        }: GameStatusObject
    ) => void;
    askingStatusUpdate: (currentlyAsking: GameStatusObject["currentlyAsking"]) => void;
    userMadeDecision: (currentlyAsking: GameStatusObject["currentlyAsking"], decision: PlayerDecision, card?: string) => void;
    getPlayerDecision: (seatId: number,
        callback: (...args: WithTimeoutAck<IsSender, [PlayerDecision]>) => void
    ) => void;
    presenterTime: (
        {
            gameState,
            timer,
            activePlayers,
            pendingPlayers,
            presenterState,
            currentlyAsking,
        }: GameStatusObject
    ) => void;
    newPresenterCard: (card: string) => void;
    gameEnded: (
        {
            gameState,
            timer,
            activePlayers,
            pendingPlayers,
            presenterState,
            currentlyAsking,
        }: GameStatusObject
    ) => void;
    balanceUpdate: (newBalance: number) => void;
    gameStarts: (
        {
            gameState,
            timer,
            activePlayers,
            pendingPlayers,
            presenterState,
            currentlyAsking,
        }: GameStatusObject
    ) => void;
}

export interface ClientToServerEvents {
    joinGameTable: (roomId: string, callback: (code: number, userOnServer?: {
        userId: number;
        username: string;
        balance: number;
    }) => void) => void;
    joinTableSeat: (seatId: number, callback: (ack: number) => void) => void;
    leaveTableSeat: (seatId: number) => void;
    placeBet: (bet: number, seatId: number, callback: (ack: number, newBalance?: number) => void) => void;
}

export type TypedSocket = Socket<ServerToClienEvents, ClientToServerEvents>;
