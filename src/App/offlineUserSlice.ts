import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface OfflineUserState {
    id: string;
    username: string;
    balance: number;
    reservedBalance: number;
}

export const initialOfflineState: OfflineUserState = {
    id: "1",
    username: "Unnamed user",
    balance: 1000,
    reservedBalance: 0,
};

export const offlineUserSlice = createSlice({
    name: "offlineUser",
    initialState: () => initialOfflineState,
    reducers: {
        addOfflineBalance: (state, action: PayloadAction<number>) => {
            state.balance += action.payload;
        },
        addOfflineReservedBalance: (state, action: PayloadAction<number>) => {
            state.reservedBalance += action.payload;
        },
        removeReservedBalance: (state, action: PayloadAction<number>) => {
            state.reservedBalance -= action.payload;
        },
        offlineGameFundReservation: (state) => {
            state.balance -= state.reservedBalance;
            state.reservedBalance = 0;
        },
        resetOfflineUserSlice: () => {
            return { ...initialOfflineState };
        },
    },
});

export const {
    addOfflineBalance, offlineGameFundReservation, addOfflineReservedBalance, removeReservedBalance,
    resetOfflineUserSlice,
} = offlineUserSlice.actions;

// eslint-disable-next-line import/no-default-export
export default offlineUserSlice.reducer;
