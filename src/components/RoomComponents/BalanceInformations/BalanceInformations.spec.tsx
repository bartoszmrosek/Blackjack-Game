import { screen, within } from "@testing-library/react";
import React from "react";
import { renderWithProviders } from "../../../utils/test-utils";
import { BalanceInformations } from "./BalanceInformations";

describe("BalanceInformations", () => {
    beforeEach(() => {
        renderWithProviders(<BalanceInformations totalInBets={100} currentBalance={50} />);
    });
    it.concurrent("should display proper user balance", () => {
        const userBalanceSection = screen.getByTestId("user-balance");
        expect(within(userBalanceSection).getByText("€ 50")).toBeInTheDocument();
    });
    it.concurrent("should display total bets balance", () => {
        const userBalanceSection = screen.getByTestId("user-totalbets");
        expect(within(userBalanceSection).getByText("€ 100")).toBeInTheDocument();
    });
});
