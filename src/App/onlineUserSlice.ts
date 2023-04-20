import { PayloadAction, createSlice } from "@reduxjs/toolkit";

type OnlineUserState = {
    id: number;
    username: string;
    balance: number;
    reservedBalance: number;
};

const initialOnlineUserState: OnlineUserState = {
    id: -1,
    username: "",
    balance: 0,
    reservedBalance: 0,
};

export const onlineUserSlice = createSlice({
    name: "onlineUser",
    initialState: initialOnlineUserState,
    reducers: {
        loginOnlineUser: (state, action: PayloadAction<OnlineUserState>) => {
            return { ...action.payload };
        },
    },
});

// eslint-disable-next-line import/no-default-export
export default onlineUserSlice.reducer;
