import { createSlice, PayloadAction } from "@reduxjs/toolkit";
// eslint-disable-next-line import/no-cycle
import { RootState } from "../mainStore";

interface CurrentUserState {
    id: string;
    name: string;
    balance: number;
    reservedBalance: number;
}

export const initialUserState: CurrentUserState = {
    id: "1",
    name: "Bartosz Mrosek",
    balance: 1000,
    reservedBalance: 0,
};

export const userSlice = createSlice({
    name: "user",
    initialState: () => initialUserState,
    reducers: {
        loginUser: (_state, action: PayloadAction<CurrentUserState>) => {
            return {
                ...action.payload,
            };
        },
        logoutUser: () => {
            return { ...initialUserState };
        },
        addBalance: (state, action: PayloadAction<number>) => {
            state.balance += action.payload;
        },
        addReservedBalance: (state, action: PayloadAction<number>) => {
            state.reservedBalance += action.payload;
        },
        removeReservedBalance: (state, action: PayloadAction<number>) => {
            state.reservedBalance -= action.payload;
        },
        gameFundReservation: (state) => {
            state.balance -= state.reservedBalance;
            state.reservedBalance = 0;
        },
        resetUserSlice: () => {
            return { ...initialUserState };
        },
    },
});

export const {
    loginUser, logoutUser, addBalance, gameFundReservation, addReservedBalance, removeReservedBalance,
    resetUserSlice,
} = userSlice.actions;

export const selectUser = (state: RootState): CurrentUserState => state.user;

// eslint-disable-next-line import/no-default-export
export default userSlice.reducer;
