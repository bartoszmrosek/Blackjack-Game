import { configureStore } from "@reduxjs/toolkit";
// eslint-disable-next-line import/no-cycle
import userReducer from "./App/userSlice";

export const store = configureStore({
    reducer: {
        user: userReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
