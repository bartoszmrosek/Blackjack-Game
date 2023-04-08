import { useCallback, useReducer } from "react";
import { Player } from "../../types/Player";
import { useAppSelector } from "../reduxHooks";
import {
    CurrentlyAskingState,
    GameActionKind,
    gameLogicReducer,
    initialGameState,
    RoundPlayer,
} from "./gamelogicReducer";

type UseGameLogicReturn = Readonly<
[
    (players: Player[]) => void,
    RoundPlayer[],
    CurrentlyAskingState | null,
    number,
]
>;

const useGameLogic = (stopGameCb: (funds: number) => void): UseGameLogicReturn => {
    const [gameLogicState, dispatchLogicUpdate] = useReducer(gameLogicReducer, initialGameState);
    const { gamePlayers, askingState, shouldAskPlayers } = gameLogicState;
    const currentUserId = useAppSelector(state => state.user.id);

    const setPlayersForGame = useCallback((players: Player[]) => {
        if (!shouldAskPlayers) {
            const expandedPlayersState: RoundPlayer[] = players.map((player) => (
                {
                    ...player,
                    cards: [],
                    cardsScore: 0,
                    currentStatus: "playing",
                    hasMadeFinalDecision: false,
                }
            ));
            dispatchLogicUpdate({ type: GameActionKind.SET_GAME_PLAYERS, payload: expandedPlayersState });
        }
    }, [shouldAskPlayers]);

    if (shouldAskPlayers && gamePlayers.length > 0) {
        const playerToAskIndex = gamePlayers.findIndex(
            (player) => !player.hasMadeFinalDecision && player.currentStatus === "playing",
        );
        if (playerToAskIndex !== -1) {
            const decidingPlayer = gamePlayers[playerToAskIndex];
            const makeDecisionFn = (decision: "hit" | "stand" | "doubleDown") => {
                dispatchLogicUpdate({
                    type: GameActionKind.UPDATE_PLAYER_STATE,
                    payload: {
                        playerIndex: playerToAskIndex,
                        decision,
                    },
                });
            };
            if (decidingPlayer.id !== askingState?.currentlyAsking.id) {
                dispatchLogicUpdate({
                    type: GameActionKind.ASK_FOR_PLAYER_DECISION,
                    payload:
                    {
                        currentlyAsking: {
                            id: decidingPlayer.id,
                            seatNumber: decidingPlayer.seatNumber,
                            cardsScore: decidingPlayer.cardsScore,
                            bet: decidingPlayer.bet,
                        },
                        makeDecision: makeDecisionFn,
                    },
                });
            }
        } else {
            dispatchLogicUpdate({ type: GameActionKind.ALL_ASKING_DONE, payload: { currentUserId, resultsCb: stopGameCb } });
        }
    }

    return [setPlayersForGame, gamePlayers, askingState, gameLogicState.presenterState.score] as const;
};

export { useGameLogic };
