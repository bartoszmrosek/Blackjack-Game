export enum PlayerActionKind {
    JOIN = "JOIN",
    LEAVE = "LEAVE",
}

export interface Player {
    id: string;
    name: string;
    bet: number;
    seatNumber: number;
}

export interface PlayerActions {
    type: PlayerActionKind.JOIN | PlayerActionKind.LEAVE;
    payload: Player;
}

export interface GameRoomState {
    playersSeats: ("empty" | Player)[];
    isGameStarted: boolean;
}

export const initialRoomState: GameRoomState = {
    playersSeats: ["empty", "empty", "empty", "empty", "empty", "empty", "empty"],
    isGameStarted: false,
};

export function gameRoomReducer(state: GameRoomState, action: PlayerActions): GameRoomState {
    const { type, payload } = action;
    switch (type) {
        case PlayerActionKind.JOIN:
            if (payload.seatNumber < 0 || payload.seatNumber > 6 || state.playersSeats.at(payload.seatNumber) !== "empty") {
                return state;
            }

            return {
                ...state,
                playersSeats: [
                    ...state.playersSeats.slice(0, payload.seatNumber),
                    payload,
                    ...state.playersSeats.slice(payload.seatNumber + 1)],
            };
        case PlayerActionKind.LEAVE:
            const searchedSeat = state.playersSeats.at(payload.seatNumber);
            if (searchedSeat !== "empty" && searchedSeat?.id === payload.id) {
                return {
                    ...state,
                    playersSeats: [
                        ...state.playersSeats.slice(0, payload.seatNumber),
                        "empty",
                        ...state.playersSeats.slice(payload.seatNumber + 1),
                    ],
                };
            }
            return state;
    }
}
