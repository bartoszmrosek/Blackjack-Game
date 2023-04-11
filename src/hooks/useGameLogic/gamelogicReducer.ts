import { Player } from "../../types/Player";
import { getCardValues } from "../../utils/getCardValues";
import { getAllPermutations } from "../../utils/getAllPermutations";
import { getRandomInt } from "../../utils/getRandomInt";
import deck from "./cardDeck.json";

export interface RoundPlayer extends Player {
    cards: string[];
    cardsScore: number[];
    hasMadeFinalDecision: boolean;
    currentStatus: "won" | "lost" | "playing" | "blackjack";
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
    presenterState: { cards: string[]; score: number[]; };
    askingState: CurrentlyAskingState | null;
    cardsInPlay: string[];
}

export const initialGameState: GameRoomState = {
    shouldAskPlayers: false,
    gamePlayers: [],
    presenterState: { cards: [], score: [0] },
    askingState: null,
    cardsInPlay: deck.deck,
};

function checkCardRules(
    player: { status: RoundPlayer["currentStatus"]; score: number[]; }, presenterScore: number,
): RoundPlayer["currentStatus"] {
    if (player.status === "lost" || player.score.every((possibleScore) => possibleScore > 21)) {
        return "lost";
    }
    const doPlayerHasBlackcjack = player.score.some((possibleScore) => possibleScore === 21);
    if (presenterScore === 21 && !doPlayerHasBlackcjack) {
        return "lost";
    }
    if (doPlayerHasBlackcjack) {
        return "blackjack";
    }
    if (Math.min(...player.score) < presenterScore) {
        return "lost";
    }
    return "won";
}

function pickNewCardFromDeck(deckRef: string[]): string {
    const newCardIndex = getRandomInt(1, deckRef.length);
    const chosenCard = deckRef.splice(newCardIndex - 1, 1)[0];
    return chosenCard;
}

export function gameLogicReducer(state: GameRoomState, action: GameActions): GameRoomState {
    switch (action.type) {
        case GameActionKind.SET_GAME_PLAYERS:
        {
            const mutableCardsInPlay = [...deck.deck];
            const newPresenterCard = pickNewCardFromDeck(mutableCardsInPlay);
            return {
                ...initialGameState,
                gamePlayers: [
                    ...action.payload.map((newPlayer) => {
                        const firstCard = pickNewCardFromDeck(mutableCardsInPlay);
                        const secondCard = pickNewCardFromDeck(mutableCardsInPlay);
                        return {
                            ...newPlayer,
                            cards: [firstCard, secondCard],
                            cardsScore: getAllPermutations(getCardValues(firstCard), getCardValues(secondCard)),
                        };
                    })],
                presenterState: { cards: [newPresenterCard], score: getCardValues(newPresenterCard) },
                shouldAskPlayers: true,
                cardsInPlay: [...mutableCardsInPlay],
            };
        }
        case GameActionKind.ASK_FOR_PLAYER_DECISION:
            return { ...state, askingState: action.payload };
        case GameActionKind.SWITCH_GAME_STATE:
            return { ...state, shouldAskPlayers: !state.shouldAskPlayers };
        case GameActionKind.RESET_GAME:
            return { ...initialGameState };
        case GameActionKind.UPDATE_PLAYER_STATE:
        {
            const { playerIndex, decision } = action.payload;
            const decidingPlayer = state.gamePlayers[playerIndex];
            switch (decision) {
                case "hit":
                {
                    const mutableCardsInPlay = [...state.cardsInPlay];
                    const newCard = pickNewCardFromDeck(mutableCardsInPlay);
                    const allScorePermutations = getAllPermutations(decidingPlayer.cardsScore, getCardValues(newCard));
                    const didLost = allScorePermutations.every((possibleScore) => possibleScore > 21);
                    return {
                        ...state,
                        gamePlayers: [
                            ...state.gamePlayers.slice(0, playerIndex),
                            {
                                ...decidingPlayer,
                                cards: [...decidingPlayer.cards, newCard],
                                cardsScore: allScorePermutations,
                                currentStatus: didLost ? "lost" : "playing",
                                hasMadeFinalDecision: didLost,
                            },
                            ...state.gamePlayers.slice(playerIndex + 1),
                        ],
                        cardsInPlay: [...mutableCardsInPlay],
                    };
                }
                case "doubleDown":
                {
                    const mutableCardsInPlay = [...state.cardsInPlay];
                    const newCard = pickNewCardFromDeck(mutableCardsInPlay);
                    const allScorePermutations = getAllPermutations(decidingPlayer.cardsScore, getCardValues(newCard));
                    const didLost = allScorePermutations.every((possibleScore) => possibleScore > 21);
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
                                cardsScore: allScorePermutations,
                                currentStatus: didLost ? "lost" : "playing",
                                hasMadeFinalDecision: true,
                            },
                            ...state.gamePlayers.slice(playerIndex + 1),
                        ],
                        cardsInPlay: [...mutableCardsInPlay],
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
                default:
                    return state;
            }
        }
        case GameActionKind.ALL_ASKING_DONE:
        {
            const mutablePresenterState = { ...state.presenterState };
            const mutableCardsInGame = [...state.cardsInPlay];
            const updatePresenterState = (presenter: GameRoomState["presenterState"]) => {
                if (Math.min(...presenter.score) < 17) {
                    const newCard = pickNewCardFromDeck(mutableCardsInGame);
                    mutablePresenterState.cards.push(newCard);
                    mutablePresenterState.score = getAllPermutations(mutablePresenterState.score, getCardValues(newCard));
                    updatePresenterState(presenter);
                }
            };
            updatePresenterState(mutablePresenterState);

            const newState = {
                ...state,
                presenterState: mutablePresenterState,
                shouldAskPlayers: false,
                askingState: null,
                gamePlayers: state.gamePlayers.map((player) => (
                    {
                        ...player,
                        currentStatus: checkCardRules(
                            { status: player.currentStatus, score: player.cardsScore },
                            Math.min(...mutablePresenterState.score),
                        ),
                    }
                )),
                cardsInPlay: [...mutableCardsInGame],
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
