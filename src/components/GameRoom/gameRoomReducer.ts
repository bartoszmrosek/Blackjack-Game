export enum PlayerActionKind {
    JOIN = "JOIN",
}

export interface Player {
    id: string;
    name: string;
    bet: number;
    seatNumber: number;
}

export interface PlayerActions {
    type: PlayerActionKind.JOIN;
    payload: Player;
}

export interface GameRoomState {
    playersSeats: ("empty" | Player)[];
}

export const initialRoomState: GameRoomState = {
    playersSeats: ["empty", "empty", "empty", "empty", "empty", "empty", "empty"],
};

export function gameRoomReducer(state: GameRoomState, action: PlayerActions): GameRoomState {
    const { type, payload } = action;
    switch (type) {
        case PlayerActionKind.JOIN:
            if (payload.seatNumber < 1 || payload.seatNumber > 7 || state.playersSeats.at(payload.seatNumber) !== "empty") {
                return state;
            }

            return {
                ...state,
                playersSeats: [
                    ...state.playersSeats.slice(0, payload.seatNumber),
                    payload,
                    ...state.playersSeats.slice(payload.seatNumber + 1)],
            };
    }
}
