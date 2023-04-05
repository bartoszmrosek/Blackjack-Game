import { createSlice, PayloadAction } from "@reduxjs/toolkit";
// eslint-disable-next-line import/no-cycle
import { RootState } from "../mainStore";

interface CurrentUserState {
    id: string;
    name: string;
    balance: number;
}

const initialState: CurrentUserState = {
    id: "1",
    name: "Bartosz Mrosek",
    balance: 1000,
};

export const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        loginUser: (_state, action: PayloadAction<CurrentUserState>) => {
            return {
                ...action.payload,
            };
        },
        logoutUser: () => {
            return { ...initialState };
        },
        addBalance: (state, action: PayloadAction<number>) => {
            state.balance += action.payload;
        },
        subtractBalance: (state, action: PayloadAction<number>) => {
            state.balance -= action.payload;
        },
    },
});

export const { loginUser, logoutUser, addBalance, subtractBalance } = userSlice.actions;

export const selectUser = (state: RootState): CurrentUserState => state.user;

// eslint-disable-next-line import/no-default-export
export default userSlice.reducer;
