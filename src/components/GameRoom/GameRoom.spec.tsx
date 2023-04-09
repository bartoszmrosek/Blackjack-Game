/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { fireEvent } from "@testing-library/react";
import React from "react";
import { renderWithProviders } from "../../utils/test-utils";
import { GameRoom } from "./GameRoom";

describe("GameRoom", () => {
    it("displays 7 buttons to join on first view", () => {
        const { getAllByRole } = renderWithProviders(<GameRoom />);
        expect(getAllByRole("button", { name: "Join now" })).toHaveLength(7);
    });
    describe("handles all bets operations before game starts", () => {
        it("handles joining and leaving in not chronological order", () => {
            const { getAllByRole, getByText } = renderWithProviders(<GameRoom />);
            const joiningButtons = getAllByRole("button", { name: "Join now" });
            fireEvent.click(joiningButtons[4]);
            fireEvent.click(document.getElementById("bet-100")!);
            fireEvent.click(joiningButtons[1]);
            fireEvent.click(document.getElementById("bet-25")!);
            expect(getByText("100")).toBeInTheDocument();
            expect(getByText("25")).toBeInTheDocument();
            const leavingButtons = getAllByRole("button", { name: "X" });
            leavingButtons.forEach((btn) => fireEvent.click(btn));
            expect(leavingButtons[0]).not.toBeInTheDocument();
            expect(leavingButtons[1]).not.toBeInTheDocument();
        });
        it("handles bet change on click", () => {
            const { getByText, getAllByRole } = renderWithProviders(<GameRoom />);
            const joiningButtons = getAllByRole("button", { name: "Join now" });
            fireEvent.click(joiningButtons[2]);
            fireEvent.click(document.getElementById("bet-100")!);
            fireEvent.click(getByText("100"));
            fireEvent.click(document.getElementById("bet-25")!);
            expect(getByText("25")).toBeInTheDocument();
        });
    });
});
