import { getCardValues } from "../../utils/getCardValues";
import { getAllPermutations } from "../../utils/getAllPermutations";
import { getRandomInt } from "../../utils/getRandomInt";
import deck from "../../cardDeck.json";
import { PresenterState } from "../../types/PresenterState.interface";
import { OfflineRoundPlayer, PlayerDecision, PlayerStatus } from "../../types/Player.interface";

export interface CurrentlyAskingState {
    currentlyAsking: Pick<OfflineRoundPlayer, "id" | "seatNumber" | "cardsScore" | "bet"> & { theirIndex: number; };
    makeDecision: (theirIndex: number, decision: PlayerDecision) => void;
}

export enum GameActionKind {
    SET_GAME_PLAYERS = "SET_GAME_PLAYERS",
    SWITCH_GAME_STATE = "SWITCH_GAME_STATE",
    RESET_GAME = "RESET_GAME",
    ALL_UPDATES_DONE = "ALL_UPDATES_DONE",
    ASK_FOR_PLAYER_DECISION = "ASK_FOR_PLAYER_DECISION",
    START_PRESENTER_TIME = "START_PRESENTER_TIME",
    PRESENTER_NEW_CARD = "PRESENTER_NEW_CARD",
    UPDATE_PLAYER_STATE = "UPDATE_PLAYER_STATE",
}

export type GameActions = {
    type: GameActionKind.SET_GAME_PLAYERS;
    payload: OfflineRoundPlayer[];
} | {
    type: GameActionKind.ASK_FOR_PLAYER_DECISION;
    payload: CurrentlyAskingState;
} | {
    type: GameActionKind.UPDATE_PLAYER_STATE;
    payload: { playerIndex: number; decision: PlayerDecision; };
} | {
    type: GameActionKind.ALL_UPDATES_DONE;
    payload: { currentUserId: string; resultsCb: (funds: number) => void; };
} | {
    type: GameActionKind.RESET_GAME
    | GameActionKind.SWITCH_GAME_STATE
    | GameActionKind.START_PRESENTER_TIME
    | GameActionKind.PRESENTER_NEW_CARD;
};

export interface TableState {
    isGameStarted: boolean;
    isShowingResults: boolean;
    presenterTime: boolean | null;
    gamePlayers: OfflineRoundPlayer[];
    presenterState: PresenterState;
    askingState: CurrentlyAskingState | null;
    cardsInPlay: string[];
}

export const initialGameState: TableState = {
    isGameStarted: false,
    isShowingResults: false,
    presenterTime: null,
    gamePlayers: [],
    presenterState: { cards: [], score: [0], didGetBlackjack: false },
    askingState: null,
    cardsInPlay: deck.deck,
};

function checkCardRules(
    player: { status: PlayerStatus; score: number[]; }, presenterScore: number | "blackjack",
): PlayerStatus {
    if (player.status === "bust" || player.status === "lost") {
        return player.status;
    }
    const acceptableScores = player.score.filter((score) => score < 22);
    if (acceptableScores.length === 0) {
        return "lost";
    }
    if (presenterScore === "blackjack") {
        if (player.status === "blackjack") { return "push"; }
        return "lost";
    }
    if (player.status === "blackjack") {
        return player.status;
    }
    if (presenterScore > 21) {
        return "won";
    }
    const heighestUserScore = Math.max(...acceptableScores);
    if (heighestUserScore === presenterScore) {
        return "push";
    }
    if (heighestUserScore < presenterScore) {
        return "lost";
    }
    return "won";
}

function pickNewCardFromDeck(deckRef: string[]): string {
    const newCardIndex = getRandomInt(1, deckRef.length);
    const chosenCard = deckRef.splice(newCardIndex - 1, 1)[0];
    return chosenCard;
}

export function gameLogicReducer(state: TableState, action: GameActions): TableState {
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
                        const startingPlayerScore = getAllPermutations(getCardValues(firstCard), getCardValues(secondCard));
                        return {
                            ...newPlayer,
                            cards: [firstCard, secondCard],
                            cardsScore: startingPlayerScore,
                            currentStatus:
                            Math.max(...startingPlayerScore) === 21 ? "blackjack" : "playing",
                        } satisfies OfflineRoundPlayer;
                    })],
                presenterState: { cards: [newPresenterCard], score: getCardValues(newPresenterCard), didGetBlackjack: false },
                isGameStarted: true,
                cardsInPlay: [...mutableCardsInPlay],
            };
        }
        case GameActionKind.ASK_FOR_PLAYER_DECISION:
            return { ...state, askingState: action.payload };
        case GameActionKind.SWITCH_GAME_STATE:
            return { ...state, isGameStarted: !state.isGameStarted };
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
                    const didBust = allScorePermutations.every((possibleScore) => possibleScore > 21);
                    return {
                        ...state,
                        gamePlayers: [
                            ...state.gamePlayers.slice(0, playerIndex),
                            {
                                ...decidingPlayer,
                                cards: [...decidingPlayer.cards, newCard],
                                cardsScore: allScorePermutations,
                                currentStatus: didBust ? "bust" : "playing",
                                hasMadeFinalDecision: didBust,
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
                    const didBust = allScorePermutations.every((possibleScore) => possibleScore > 21);
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
                                currentStatus: didBust ? "bust" : "playing",
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
        case GameActionKind.ALL_UPDATES_DONE:
        {
            const newState: TableState = {
                ...state,
                askingState: null,
                gamePlayers: state.gamePlayers.map((player) => (
                    {
                        ...player,
                        currentStatus: checkCardRules(
                            { status: player.currentStatus, score: player.cardsScore },
                            state.presenterState.didGetBlackjack ? "blackjack" : Math.min(...state.presenterState.score),
                        ),
                    }
                )),
                isShowingResults: true,
                presenterTime: null,
            };

            const balanceToAdd = newState.gamePlayers.reduce((acc, player) => {
                let updatedBalance = acc;
                if (player.currentStatus === "won" || player.currentStatus === "blackjack") {
                    updatedBalance += player.bet.currentBet * 2;
                }
                if (player.currentStatus === "push") {
                    updatedBalance += player.bet.currentBet;
                }
                return updatedBalance;
            }, 0);
            action.payload.resultsCb(balanceToAdd);
            return newState;
        }
        case GameActionKind.START_PRESENTER_TIME:
            return { ...state, presenterTime: true, askingState: null };
        case GameActionKind.PRESENTER_NEW_CARD:
        {
            const { score, didGetBlackjack, cards } = state.presenterState;
            const newDeck = [...state.cardsInPlay];
            const newCard = pickNewCardFromDeck(newDeck);
            const newScore = getAllPermutations(score, getCardValues(newCard));
            const shouldAskAgain = didGetBlackjack ? false : Math.min(...newScore) < 17;
            return {
                ...state,
                presenterTime: shouldAskAgain,
                presenterState: {
                    didGetBlackjack: cards.length === 1 && Math.max(...newScore) === 21,
                    cards: [...cards, newCard],
                    score: newScore,
                },
                cardsInPlay: newDeck,
            };
        }
    }
}
