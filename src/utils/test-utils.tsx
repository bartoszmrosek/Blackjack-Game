import { PreloadedState, configureStore } from "@reduxjs/toolkit";
import { render, RenderOptions } from "@testing-library/react";
import React, { PropsWithChildren } from "react";
import { Provider } from "react-redux";

import userReducer from "../App/userSlice";
import type { RootState, AppStore } from "../mainStore";

interface ExtendedRenderOptions extends Omit<RenderOptions, "queries"> {
    preloadedState?: PreloadedState<RootState>;
    store?: AppStore;
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function renderWithProviders(
    ui: React.ReactElement,
    {
        preloadedState = {},
        store = configureStore({ reducer: { user: userReducer }, preloadedState }),
        ...renderOptions
    }: ExtendedRenderOptions = {},
) {
    function Wrapper({ children }: PropsWithChildren<object>): JSX.Element {
        return <Provider store={store}>{children}</Provider>;
    }

    return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
}
