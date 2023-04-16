import { Player } from "./Player";

export interface RoundPlayer extends Player {
    cards: string[];
    cardsScore: number[];
    hasMadeFinalDecision: boolean;
    currentStatus: "won" | "lost" | "playing" | "blackjack" | "bust" | "push";
}
