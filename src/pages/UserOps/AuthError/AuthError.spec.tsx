import React from "react";
import { vi } from "vitest";
import { act, screen } from "@testing-library/react";
import { renderWithProviders } from "../../../utils/test-utils";
import { AuthError } from "./AuthError";
import { initialOnlineUserState } from "../../../App/onlineUserSlice";
import { setupStore } from "../../../mainStore";

const LOGGED_USER = { ...initialOnlineUserState, id: 1 };
const MOCKED_STORE = setupStore({ onlineUser: LOGGED_USER });
describe("AuthError", () => {
    beforeEach(() => {
        vi.useFakeTimers();
        renderWithProviders(<AuthError />, { store: MOCKED_STORE });
        return () => vi.useRealTimers();
    });
    it("should logout user on render", () => {
        expect(MOCKED_STORE.getState()).toMatchObject({ onlineUser: initialOnlineUserState });
    });
    it("should display countdown to redirect", () => {
        expect(screen.getByText("You will be redirected to home page in 8 seconds")).toBeInTheDocument();
    });
    it("after time redirects to homepage", () => {
        act(() => {
            vi.advanceTimersByTime(8500);
            expect(window.location.pathname).toBe("/");
        });
    });
});
