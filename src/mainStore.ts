import { combineReducers, configureStore, PreloadedState } from "@reduxjs/toolkit";
// eslint-disable-next-line import/no-cycle
import userReducer from "./App/userSlice";

const rootReducer = combineReducers({
    user: userReducer,
});

// Following reduxjs documentation on setting reusable unit tests
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function setupStore(preloadedState?: PreloadedState<RootState>) {
    return configureStore({
        reducer: rootReducer,
        preloadedState,
    });
}

export type RootState = ReturnType<typeof rootReducer>;
export type AppStore = ReturnType<typeof setupStore>;
export type AppDispatch = AppStore["dispatch"];
