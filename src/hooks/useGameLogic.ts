import { useCallback, useState } from "react";
import { Player } from "../types/Player";
import { getRandomInt } from "../utils/getRandomInt";

interface RoundPlayer extends Player {
    cards: number[];
    didDoubleDown: boolean;
    hasMadeDecisionInCurrentRound: boolean;
    currentStatus: "won" | "lost" | "playing";
}

interface CurrentlyAskingState {
    currentlyAsking: Pick<Player, "id" | "seatNumber">;
    makeDecision: (decision: "hit" | "stand" | "doubleDown") => void;
}

type UseGameLogicReturn = Readonly<
[
    (players: Player[]) => void,
    RoundPlayer[],
    CurrentlyAskingState | null,
]
>;

const useGameLogic = (): UseGameLogicReturn => {
    const [isRoundInProgress, setIsRoundInProgress] = useState<number>(0);
    const [roundPlayers, setRoundPlayers] = useState<RoundPlayer[]>([]);
    const [currentlyAsking, setCurrentlyAsking] = useState<CurrentlyAskingState | null>(null);

    const setPlayersForGame = useCallback((players: Player[]) => {
        if (isRoundInProgress) { return; }
        const expandedPlayersState: RoundPlayer[] = players.map((player) => (
            { ...player, cards: [], currentStatus: "playing", hasMadeDecisionInCurrentRound: false, didDoubleDown: false }
        ));
        setRoundPlayers(expandedPlayersState);
        setIsRoundInProgress(1);
    }, [isRoundInProgress]);

    if (roundPlayers.every(player => player.currentStatus !== "playing") && isRoundInProgress !== 0) {
        setIsRoundInProgress(0);
    }

    if (isRoundInProgress > 0) {
        const playerToAsk = roundPlayers.findIndex((player) => player.hasMadeDecisionInCurrentRound !== true);
        if (playerToAsk !== -1) {
            const makeDecision = (decision: "hit" | "stand" | "doubleDown"): void => {
                switch (decision) {
                    case "hit":
                        setRoundPlayers(players =>
                            [
                                ...players.slice(0, playerToAsk),
                                {
                                    ...players[playerToAsk],
                                    cards: [...players[playerToAsk].cards, getRandomInt(1, 10)],
                                    hasMadeDecisionInCurrentRound: true,
                                },
                                ...players.slice(playerToAsk + 1),
                            ],
                        );
                        break;
                    case "doubleDown":
                        setRoundPlayers(players =>
                            [
                                ...players.slice(0, playerToAsk),
                                {
                                    ...players[playerToAsk],
                                    cards: [...players[playerToAsk].cards, getRandomInt(1, 10)],
                                    hasMadeDecisionInCurrentRound: true,
                                    didDoubleDown: true,
                                },
                                ...players.slice(playerToAsk + 1),
                            ],
                        );
                        break;
                    case "stand":
                        setRoundPlayers(players =>
                            [
                                ...players.slice(0, playerToAsk),
                                {
                                    ...players[playerToAsk],
                                    hasMadeDecisionInCurrentRound: true,
                                },
                                ...players.slice(playerToAsk + 1),
                            ],
                        );
                        break;
                }
            };
            if (currentlyAsking?.currentlyAsking.id !== roundPlayers[playerToAsk].id) {
                setCurrentlyAsking({
                    currentlyAsking:
                    { id: roundPlayers[playerToAsk].id, seatNumber: roundPlayers[playerToAsk].seatNumber },
                    makeDecision,
                });
            }
        } else {
            setIsRoundInProgress(prev => prev + 1);
        }
    }

    // is round in progress ?
    // on start draw cards for everyone including game presenter
    // take all players and go from playerArr.length -1 to playerArr[0] (from right to left)
    // give them decision to make, no further updates untill decision is made (has to be timelimit for one)
    // take decision and update player informations, like card array and other things
    // play untill everyone either wins or loses, the game presenter draws up to 17 and then stops
    // at the end of round check who won and who lost and dispatch proper updates to balance
    return [setPlayersForGame, roundPlayers, currentlyAsking] as const;
};

export { useGameLogic };
