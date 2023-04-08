import { Player } from "../../types/Player";
import { getRandomInt } from "../../utils/getRandomInt";

export interface RoundPlayer extends Player {
    cards: number[];
    cardsScore: number;
    didDoubleDown: boolean;
    hasMadeDecisionInCurrentRound: boolean;
    currentStatus: "won" | "lost" | "playing";
}

export interface CurrentlyAskingState {
    currentlyAsking: Pick<RoundPlayer, "id" | "seatNumber" | "cardsScore">;
    makeDecision: (decision: "hit" | "stand" | "doubleDown") => void;
}

export enum GameActionKind {
    SET_GAME_PLAYERS = "SET_GAME_PLAYERS",
    RESET_GAME = "RESET_GAME",
    NEXT_ROUND = "NEXT_ROUND",
    ASK_FOR_PLAYER_DECISION = "ASK_FOR_PLAYER_DECISION",
    UPDATE_PLAYER_STATE = "UPDATE_PLAYER_STATE",
}

export type GameActions = {
    type: GameActionKind.SET_GAME_PLAYERS;
    payload: RoundPlayer[];
} | {
    type: GameActionKind.ASK_FOR_PLAYER_DECISION;
    payload: CurrentlyAskingState;
} | {
    type: GameActionKind.UPDATE_PLAYER_STATE;
    payload: { playerIndex: number; decision: "hit" | "stand" | "doubleDown"; };
} | {
    type: GameActionKind.RESET_GAME | GameActionKind.NEXT_ROUND;
};

export interface GameRoomState {
    roundInProgress: number;
    gamePlayers: RoundPlayer[];
    presenterState: { cards: number[]; score: number; };
    askingState: CurrentlyAskingState | null;
}

export const initialGameState: GameRoomState = {
    roundInProgress: 0,
    gamePlayers: [],
    presenterState: { cards: [], score: 0 },
    askingState: null,
};

function checkGameScoreRules(playerScore: number, presenterScore: number): RoundPlayer["currentStatus"] {
    if (presenterScore <= 17) {
        if (playerScore > 21) { return "lost"; }
        return "playing";
    }
    if (playerScore > 21 && playerScore < presenterScore) { return "lost"; }
    return "won";
}

export function gameLogicReducer(state: GameRoomState, action: GameActions): GameRoomState {
    switch (action.type) {
        case GameActionKind.SET_GAME_PLAYERS:
            return { ...initialGameState, roundInProgress: 1, gamePlayers: action.payload };
        case GameActionKind.ASK_FOR_PLAYER_DECISION:
            return { ...state, askingState: action.payload };
        case GameActionKind.RESET_GAME:
            return { ...initialGameState, gamePlayers: state.gamePlayers, presenterState: state.presenterState };
        case GameActionKind.NEXT_ROUND:
            const newPresenterCard = getRandomInt(1, 10);
            return {
                ...state,
                roundInProgress: state.roundInProgress + 1,
                gamePlayers: state.gamePlayers.map((player) =>
                    ({
                        ...player,
                        hasMadeDecisionInCurrentRound: false,
                        didDoubleDown: false,
                        currentStatus: checkGameScoreRules(player.cardsScore, state.presenterState.score + newPresenterCard),
                    })),
                presenterState: {
                    cards: [...state.presenterState.cards, newPresenterCard],
                    score: state.presenterState.score + newPresenterCard,
                },
            };
        case GameActionKind.UPDATE_PLAYER_STATE:
        {
            const { decision, playerIndex } = action.payload;
            const pickedUser = state.gamePlayers[playerIndex];
            switch (decision) {
                case "hit":
                {
                    const newCard = getRandomInt(1, 10);
                    return {
                        ...state,
                        askingState: null,
                        gamePlayers: [
                            ...state.gamePlayers.slice(0, playerIndex),
                            {
                                ...pickedUser,
                                hasMadeDecisionInCurrentRound: true,
                                cards: [...pickedUser.cards, newCard],
                                cardsScore: pickedUser.cardsScore + newCard,
                                currentStatus: checkGameScoreRules(pickedUser.cardsScore + newCard, state.presenterState.score),
                            },
                            ...state.gamePlayers.slice(playerIndex + 1),
                        ],
                    };
                }
                case "stand":
                {
                    return {
                        ...state,
                        askingState: null,
                        gamePlayers: [
                            ...state.gamePlayers.slice(0, playerIndex),
                            {
                                ...pickedUser,
                                hasMadeDecisionInCurrentRound: true,
                                currentStatus: checkGameScoreRules(pickedUser.cardsScore, state.presenterState.score),
                            },
                            ...state.gamePlayers.slice(playerIndex + 1),
                        ],
                    };
                }
                case "doubleDown":
                {
                    const newCard = getRandomInt(1, 10);
                    return {
                        ...state,
                        askingState: null,
                        gamePlayers: [
                            ...state.gamePlayers.slice(0, playerIndex),
                            {
                                ...pickedUser,
                                hasMadeDecisionInCurrentRound: true,
                                cards: [...pickedUser.cards, newCard],
                                cardsScore: pickedUser.cardsScore + newCard,
                                currentStatus: checkGameScoreRules(pickedUser.cardsScore + newCard, state.presenterState.score),
                                didDoubleDown: true,
                            },
                            ...state.gamePlayers.slice(playerIndex + 1),
                        ],
                    };
                }
            }
        }
    }
}
