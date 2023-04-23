export type PlayerStatus = "won" | "lost" | "playing" | "blackjack" | "bust" | "push";
export type PlayerDecision = "hit" | "stand" | "doubleDown";

export type OfflinePlayer = {
    id: string;
    name: string;
    bet: {
        currentBet: number;
        previousBet: number;
    };
    seatNumber: number;
};

export interface OfflineRoundPlayer extends OfflinePlayer {
    cards: string[];
    cardsScore: number[];
    hasMadeFinalDecision: boolean;
    currentStatus: PlayerStatus;
}

export type OnlinePendingPlayer = {
    seatId: number;
    bet: number;
    previousBet: number;
    username: string;
    userId: number;
};

export type OnlineActivePlayer = {
    status: PlayerStatus;
    cards: string[];
    cardsScore: number[];
    decision: PlayerDecision | null;
    hasMadeFinalDecision: boolean;
} & OnlinePendingPlayer;

export type PlayerBets = Pick<OnlinePendingPlayer, "seatId" | "bet" | "previousBet">;
