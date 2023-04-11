import { Player } from "../../types/Player";
import { getRandomInt } from "../../utils/getRandomInt";
import deck from "./cardDeck.json";

export interface RoundPlayer extends Player {
    cards: number[];
    cardsScore: number;
    hasMadeFinalDecision: boolean;
    currentStatus: "won" | "lost" | "playing";
}

export interface CurrentlyAskingState {
    currentlyAsking: Pick<RoundPlayer, "id" | "seatNumber" | "cardsScore" | "bet"> & { theirIndex: number; };
    makeDecision: (theirIndex: number, decision: "hit" | "stand" | "doubleDown") => void;
}

export enum GameActionKind {
    SET_GAME_PLAYERS = "SET_GAME_PLAYERS",
    SWITCH_GAME_STATE = "SWITCH_GAME_STATE",
    RESET_GAME = "RESET_GAME",
    ALL_ASKING_DONE = "ALL_ASKING_DONE",
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
    type: GameActionKind.ALL_ASKING_DONE;
    payload: { currentUserId: string; resultsCb: (funds: number) => void; };
} | {
    type: GameActionKind.RESET_GAME | GameActionKind.SWITCH_GAME_STATE;
};

export interface GameRoomState {
    shouldAskPlayers: boolean;
    gamePlayers: RoundPlayer[];
    presenterState: { cards: number[]; score: number; };
    askingState: CurrentlyAskingState | null;
    cardsInPlay: string[];
}

export const initialGameState: GameRoomState = {
    shouldAskPlayers: false,
    gamePlayers: [],
    presenterState: { cards: [], score: 0 },
    askingState: null,
    cardsInPlay: deck.deck,
};

function checkCardRules(
    player: { status: RoundPlayer["currentStatus"]; score: number; }, presenterScore: number,
): RoundPlayer["currentStatus"] {
    if (player.status === "lost" || player.score > 21) { return "lost"; }
    if (presenterScore > 21) { return "won"; }
    if (player.score < presenterScore) { return "lost"; }
    return "won";
}

export function gameLogicReducer(state: GameRoomState, action: GameActions): GameRoomState {
    switch (action.type) {
        case GameActionKind.SET_GAME_PLAYERS:
        {
            const newPresenterCard = getRandomInt(1, 10);
            return {
                ...initialGameState,
                gamePlayers: [
                    ...action.payload.map((newPlayer) => {
                        const newInitialCards = [getRandomInt(1, 10), getRandomInt(1, 10)];
                        return {
                            ...newPlayer,
                            cards: newInitialCards,
                            cardsScore: newInitialCards[0] + newInitialCards[1],
                        };
                    })],
                presenterState: { cards: [newPresenterCard], score: newPresenterCard },
                shouldAskPlayers: true,
            };
        }
        case GameActionKind.ASK_FOR_PLAYER_DECISION:
            return { ...state, askingState: action.payload };
        case GameActionKind.SWITCH_GAME_STATE:
            return { ...state, shouldAskPlayers: !state.shouldAskPlayers };
        case GameActionKind.RESET_GAME:
            return { ...initialGameState, gamePlayers: state.gamePlayers, presenterState: state.presenterState };
        case GameActionKind.UPDATE_PLAYER_STATE:
        {
            const { playerIndex, decision } = action.payload;
            const decidingPlayer = state.gamePlayers[playerIndex];
            switch (decision) {
                case "hit":
                {
                    const newCard = getRandomInt(1, 10);
                    return {
                        ...state,
                        gamePlayers: [
                            ...state.gamePlayers.slice(0, playerIndex),
                            {
                                ...decidingPlayer,
                                cards: [...decidingPlayer.cards, newCard],
                                cardsScore: decidingPlayer.cardsScore + newCard,
                                currentStatus: decidingPlayer.cardsScore + newCard > 21 ? "lost" : "playing",
                                hasMadeFinalDecision: decidingPlayer.cardsScore + newCard > 21,
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
                        gamePlayers: [
                            ...state.gamePlayers.slice(0, playerIndex),
                            {
                                ...decidingPlayer,
                                bet: {
                                    ...decidingPlayer.bet,
                                    currentBet: decidingPlayer.bet.currentBet * 2,
                                    previousBet: decidingPlayer.bet.currentBet,
                                },
                                cards: [...decidingPlayer.cards, newCard],
                                cardsScore: decidingPlayer.cardsScore + newCard,
                                currentStatus: decidingPlayer.cardsScore + newCard > 21 ? "lost" : "playing",
                                hasMadeFinalDecision: true,
                            },
                            ...state.gamePlayers.slice(playerIndex + 1),
                        ],
                    };
                }
                case "stand":
                {
                    return {
                        ...state,
                        gamePlayers: [
                            ...state.gamePlayers.slice(0, playerIndex),
                            { ...decidingPlayer, hasMadeFinalDecision: true },
                            ...state.gamePlayers.slice(playerIndex + 1),
                        ],
                    };
                }
            }
            return state;
        }
        case GameActionKind.ALL_ASKING_DONE:
        {
            const mutatedPresenterState = { ...state.presenterState };
            const updatePresenterState = (presenter: GameRoomState["presenterState"]) => {
                if (presenter.score < 17) {
                    const newCard = getRandomInt(1, 10);
                    mutatedPresenterState.cards.push(newCard);
                    mutatedPresenterState.score += newCard;
                    updatePresenterState(presenter);
                }
            };
            updatePresenterState(mutatedPresenterState);

            const newState = {
                ...state,
                presenterState: mutatedPresenterState,
                shouldAskPlayers: false,
                askingState: null,
                gamePlayers: state.gamePlayers.map((player) => (
                    {
                        ...player,
                        currentStatus: checkCardRules(
                            { status: player.currentStatus, score: player.cardsScore }, mutatedPresenterState.score,
                        ),
                    }
                )),
            };

            const balanceToAdd = newState.gamePlayers.reduce((acc, player) => {
                let updatedBalance = acc;
                if (player.id === action.payload.currentUserId &&
                    player.currentStatus === "won") {
                    updatedBalance += player.bet.currentBet * 2;
                }
                return updatedBalance;
            }, 0);
            action.payload.resultsCb(balanceToAdd);
            return newState;
        }
    }
}
