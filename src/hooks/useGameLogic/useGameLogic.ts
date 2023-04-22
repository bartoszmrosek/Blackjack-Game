import { useCallback, useEffect, useReducer } from "react";
import { OfflineRoundPlayer, OfflinePlayer, PlayerDecision } from "../../types/Player.interface";
import { addOfflineBalance } from "../../App/offlineUserSlice";
import { useAppDispatch, useAppSelector } from "../reduxHooks";
import {
    CurrentlyAskingState,
    GameActionKind,
    gameLogicReducer,
    TableState,
    initialGameState,
} from "./tableLogicReducer";

type UseGameLogicReturn = Readonly<
[
    (players: OfflinePlayer[]) => void,
    OfflineRoundPlayer[],
    CurrentlyAskingState | null,
    TableState["presenterState"],
]
>;

const useGameLogic = (stopGameCb: (funds: number) => void, resetGameCb: () => void): UseGameLogicReturn => {
    const [gameLogicState, dispatchLogicUpdate] = useReducer(gameLogicReducer, initialGameState);
    const { gamePlayers, askingState, isGameStarted, isShowingResults } = gameLogicState;
    const currentUserId = useAppSelector(state => state.offlineUser.id);
    const dispatchUserAction = useAppDispatch();

    const setPlayersForGame = useCallback((players: OfflinePlayer[]) => {
        if (!isGameStarted) {
            const expandedPlayersState: OfflineRoundPlayer[] = players.map((player) => (
                {
                    ...player,
                    cards: [],
                    cardsScore: [0],
                    currentStatus: "playing",
                    hasMadeFinalDecision: false,
                }
            ));
            dispatchLogicUpdate({ type: GameActionKind.SET_GAME_PLAYERS, payload: expandedPlayersState });
        }
    }, [isGameStarted]);

    const makeDecision = useCallback((playerToAskIndex: number, decision: PlayerDecision) => {
        if (decision === "doubleDown") {
            dispatchUserAction(addOfflineBalance(-gamePlayers[playerToAskIndex].bet.currentBet));
        }
        dispatchLogicUpdate({
            type: GameActionKind.UPDATE_PLAYER_STATE,
            payload: {
                playerIndex: playerToAskIndex,
                decision,
            },
        });
    }, [dispatchUserAction, gamePlayers]);

    if (isGameStarted && gamePlayers.length > 0 && !isShowingResults) {
        const playerToAskIndex = gamePlayers.findIndex(
            (player) => !player.hasMadeFinalDecision && player.currentStatus === "playing",
        );
        if (playerToAskIndex !== -1) {
            const decidingPlayer = gamePlayers[playerToAskIndex];
            if (decidingPlayer.id !== askingState?.currentlyAsking.id ||
                decidingPlayer.seatNumber !== askingState?.currentlyAsking.seatNumber
            ) {
                dispatchLogicUpdate({
                    type: GameActionKind.ASK_FOR_PLAYER_DECISION,
                    payload:
                    {
                        currentlyAsking: {
                            id: decidingPlayer.id,
                            seatNumber: decidingPlayer.seatNumber,
                            cardsScore: decidingPlayer.cardsScore,
                            bet: decidingPlayer.bet,
                            theirIndex: playerToAskIndex,
                        },
                        makeDecision,
                    },
                });
            }
        } else {
            dispatchLogicUpdate({ type: GameActionKind.ALL_ASKING_DONE, payload: { currentUserId, resultsCb: stopGameCb } });
        }
    }

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (isShowingResults) {
            timer = setTimeout(() => {
                dispatchLogicUpdate({ type: GameActionKind.RESET_GAME });
                resetGameCb();
            }, 5000);
        }
        return () => clearTimeout(timer);
    }, [isShowingResults, resetGameCb]);
    return [setPlayersForGame, gamePlayers, askingState, gameLogicState.presenterState] as const;
};

export { useGameLogic };
