import { combineReducers } from "@reduxjs/toolkit";
import offlineUserReducer from "./App/offlineUserSlice";
import onlineUserReducer from "./App/onlineUserSlice";

export const rootReducer = combineReducers({
    offlineUser: offlineUserReducer,
    onlineUser: onlineUserReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
