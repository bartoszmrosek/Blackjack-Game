import { configureStore, PreloadedState } from "@reduxjs/toolkit";
// eslint-disable-next-line import/no-cycle
import { rootReducer, RootState } from "./rootReducer";

// Following reduxjs documentation on setting reusable unit tests
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function setupStore(preloadedState?: PreloadedState<RootState>) {
    return configureStore({
        reducer: rootReducer,
        preloadedState,
    });
}

export type AppStore = ReturnType<typeof setupStore>;
export type AppDispatch = AppStore["dispatch"];
