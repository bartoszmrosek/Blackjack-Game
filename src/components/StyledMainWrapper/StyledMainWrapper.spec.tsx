import React from "react";
import { screen, act } from "@testing-library/react";
import { renderWithProviders } from "../../utils/test-utils";
import { StyledMainWrapper } from "./StyledMainWrapper";
import { initialOnlineUserState, loginOnlineUser } from "../../App/onlineUserSlice";
import { setupStore } from "../../mainStore";

describe("StyledMainWrapper", () => {
    const TESTING_STORE = setupStore({ onlineUser: initialOnlineUserState });
    const newLoggedUser = {
        id: 1,
        balance: 1000,
        reservedBalance: 0,
        username: "",
    };
    beforeEach(() => {
        renderWithProviders(<StyledMainWrapper />, { store: TESTING_STORE });
    });
    it("Shouldn`t display user balance if user is not logged in", () => {
        expect(screen.queryByTestId("user-balance")).not.toBeInTheDocument();
    });
    it("Should display proper user balance when user changes", () => {
        act(() => {
            TESTING_STORE.dispatch(loginOnlineUser(newLoggedUser));
        });
        expect(screen.getByText(`€ ${newLoggedUser.balance}`)).toBeInTheDocument();
    });
});
