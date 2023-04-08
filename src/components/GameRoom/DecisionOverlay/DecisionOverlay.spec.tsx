import { fireEvent } from "@testing-library/react";
import React from "react";
import { vi } from "vitest";
import { initialUserState, renderWithProviders } from "../../../utils/test-utils";
import { DecisionOverlay } from "./DecisionOverlay";

const defaultMock = vi.fn();
describe("Decision overlay", () => {
    it("fires callback function on buttons click with proper arguments", () => {
        const callbackMock = vi.fn();
        const { getAllByRole } = renderWithProviders(<DecisionOverlay
            decisionCb={callbackMock}
            presenterScore={0}
            theirIndex={1}
            playerScore={0}
            currentBet={0}
        />);
        const allButtons = getAllByRole("button");
        allButtons.forEach((button) => fireEvent.click(button));
        expect(callbackMock).toHaveBeenCalledTimes(3);
        expect(callbackMock).toHaveBeenCalledWith(1, "doubleDown");
        expect(callbackMock).toHaveBeenCalledWith(1, "stand");
        expect(callbackMock).toHaveBeenCalledWith(1, "hit");
    });
    it("displays scores properly", () => {
        const presenterScore = 0;
        const playerScore = 10;

        const { getByText } = renderWithProviders(<DecisionOverlay
            decisionCb={defaultMock}
            presenterScore={presenterScore}
            theirIndex={1}
            playerScore={playerScore}
            currentBet={0}
        />);
        expect(getByText(`My score: ${playerScore}`)).toBeInTheDocument();
        expect(getByText(`Presenter score: ${presenterScore}`)).toBeInTheDocument();
    });
    it("blocks double down button if funds cannot afford it", () => {
        const { getByRole } = renderWithProviders(<DecisionOverlay
            decisionCb={defaultMock}
            presenterScore={0}
            theirIndex={1}
            playerScore={0}
            currentBet={100}
        />, {
            preloadedState: {
                user: {
                    ...initialUserState,
                    balance: 50,
                },
            },
        });
        expect(getByRole("button", { name: "Doubledown" })).toBeDisabled();
    });
});
