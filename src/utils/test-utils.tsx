import { PreloadedState } from "@reduxjs/toolkit";
import { act, render, RenderOptions } from "@testing-library/react";
import React, { PropsWithChildren } from "react";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";

import { vi } from "vitest";
import { AppStore, setupStore } from "../mainStore";
import { RootState } from "../rootReducer";

interface ExtendedRenderOptions extends Omit<RenderOptions, "queries"> {
    preloadedState?: PreloadedState<RootState>;
    store?: AppStore;
    route?: string;
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function renderWithProviders(
    ui: React.ReactElement,
    {
        preloadedState = {},
        store = setupStore(preloadedState),
        route = "/",
        ...renderOptions
    }: ExtendedRenderOptions = {},
) {
    window.history.pushState({}, "Test page", route);
    function Wrapper({ children }: PropsWithChildren<object>): JSX.Element {
        return (
            <BrowserRouter>
                <Provider store={store}>{children}</Provider>
            </BrowserRouter>
        );
    }

    return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
}

export function advanceTimerTimes(times: number): void {
    for (let i = 0; i < times; i++) {
        act(() => {
            vi.advanceTimersToNextTimer();
        });
    }
}
