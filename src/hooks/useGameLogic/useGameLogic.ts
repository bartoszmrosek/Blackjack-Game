import { useCallback, useReducer } from "react";
import { Player } from "../../types/Player";
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

const useGameLogic = (stopGameCb: () => void): UseGameLogicReturn => {
    const [gameLogicState, dispatchLogicUpdate] = useReducer(gameLogicReducer, initialGameState);
    const { roundInProgress, gamePlayers, askingState } = gameLogicState;

    const setPlayersForGame = useCallback((players: Player[]) => {
        if (roundInProgress) { return; }
        const expandedPlayersState: RoundPlayer[] = players.map((player) => (
            {
                ...player,
                cards: [],
                cardsScore: 0,
                currentStatus: "playing",
                hasMadeDecisionInCurrentRound: false,
                didDoubleDown: false,
            }
        ));
        dispatchLogicUpdate({ type: GameActionKind.SET_GAME_PLAYERS, payload: expandedPlayersState });
    }, [roundInProgress]);

    if (gamePlayers.every(player => player.currentStatus !== "playing") && roundInProgress !== 0) {
        stopGameCb();
        dispatchLogicUpdate({ type: GameActionKind.RESET_GAME });
    }

    if (roundInProgress > 0) {
        const playerToAsk = gamePlayers.findIndex((player) =>
            player.hasMadeDecisionInCurrentRound !== true && player.currentStatus === "playing");
        if (playerToAsk !== -1) {
            const makeDecision = (decision: "hit" | "stand" | "doubleDown"): void => {
                switch (decision) {
                    case "hit":
                        dispatchLogicUpdate({
                            type: GameActionKind.UPDATE_PLAYER_STATE,
                            payload: { playerIndex: playerToAsk, decision: "hit" },
                        });
                        break;
                    case "doubleDown":
                        dispatchLogicUpdate({
                            type: GameActionKind.UPDATE_PLAYER_STATE,
                            payload: { playerIndex: playerToAsk, decision: "doubleDown" },
                        });
                        break;
                    case "stand":
                        dispatchLogicUpdate({
                            type: GameActionKind.UPDATE_PLAYER_STATE,
                            payload: { playerIndex: playerToAsk, decision: "stand" },
                        });
                        break;
                }
            };
            if (askingState === null || askingState.currentlyAsking.id !== gamePlayers[playerToAsk].id) {
                dispatchLogicUpdate({
                    type: GameActionKind.ASK_FOR_PLAYER_DECISION,
                    payload: {
                        currentlyAsking:
                        {
                            id: gamePlayers[playerToAsk].id,
                            seatNumber: gamePlayers[playerToAsk].seatNumber,
                            cardsScore: gamePlayers[playerToAsk].cardsScore,
                        },
                        makeDecision,
                    },
                });
            }
        } else if (!gamePlayers.every(player => player.currentStatus !== "playing")) {
            dispatchLogicUpdate({ type: GameActionKind.NEXT_ROUND });
        }
    }

    // is round in progress ?
    // on start draw cards for everyone including game presenter
    // take all players and go from playerArr.length -1 to playerArr[0] (from right to left)
    // give them decision to make, no further updates untill decision is made (has to be timelimit for one)
    // take decision and update player informations, like card array and other things
    // play untill everyone either wins or loses, the game presenter draws up to 17 and then stops
    // at the end of round check who won and who lost and dispatch proper updates to balance
    return [setPlayersForGame, gamePlayers, askingState, gameLogicState.presenterState.score] as const;
};

export { useGameLogic };