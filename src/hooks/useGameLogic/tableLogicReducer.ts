import { getCardValues } from "../../utils/getCardValues";
import { getAllPermutations } from "../../utils/getAllPermutations";
import { getRandomInt } from "../../utils/getRandomInt";
import deck from "../../cardDeck.json";
import { PresenterState } from "../../types/PresenterState";
import { RoundPlayer } from "../../types/RoundPlayer";

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

export interface TableState {
    isGameStarted: boolean;
    isShowingResults: boolean;
    gamePlayers: RoundPlayer[];
    presenterState: PresenterState;
    askingState: CurrentlyAskingState | null;
    cardsInPlay: string[];
}

export const initialGameState: TableState = {
    isGameStarted: false,
    isShowingResults: false,
    gamePlayers: [],
    presenterState: { cards: [], score: [0], didGetBlackjack: false },
    askingState: null,
    cardsInPlay: deck.deck,
};

function checkCardRules(
    player: { status: RoundPlayer["currentStatus"]; score: number[]; }, presenterScore: number | "blackjack",
): RoundPlayer["currentStatus"] {
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
                        } satisfies RoundPlayer;
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
        case GameActionKind.ALL_ASKING_DONE:
        {
            const mutablePresenterState = { ...state.presenterState };
            const mutableCardsInGame = [...state.cardsInPlay];
            const updatePresenterState = (presenter: TableState["presenterState"], iteration: number) => {
                if (!presenter.didGetBlackjack && Math.min(...presenter.score) < 17) {
                    const newCard = pickNewCardFromDeck(mutableCardsInGame);
                    const newScore = getAllPermutations(mutablePresenterState.score, getCardValues(newCard));
                    mutablePresenterState.cards = [...mutablePresenterState.cards, newCard];
                    mutablePresenterState.score = newScore;
                    if (iteration === 0 && Math.max(...newScore) === 21) {
                        mutablePresenterState.didGetBlackjack = true;
                    }
                    updatePresenterState(presenter, iteration + 1);
                }
            };
            updatePresenterState(mutablePresenterState, 0);

            const newState: TableState = {
                ...state,
                presenterState: mutablePresenterState,
                askingState: null,
                gamePlayers: state.gamePlayers.map((player) => (
                    {
                        ...player,
                        currentStatus: checkCardRules(
                            { status: player.currentStatus, score: player.cardsScore },
                            mutablePresenterState.didGetBlackjack ? "blackjack" : Math.min(...mutablePresenterState.score),
                        ),
                    }
                )),
                cardsInPlay: [...mutableCardsInGame],
                isShowingResults: true,
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
    }
}
