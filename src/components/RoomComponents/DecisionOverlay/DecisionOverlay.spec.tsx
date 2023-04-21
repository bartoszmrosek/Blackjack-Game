import { fireEvent } from "@testing-library/react";
import React from "react";
import { vi } from "vitest";
import { initialOfflineState } from "../../../App/offlineUserSlice";
import { renderWithProviders } from "../../../utils/test-utils";
import { DecisionOverlay } from "./DecisionOverlay";

const defaultMock = vi.fn();
describe("Decision overlay", () => {
    it("fires callback function on buttons click with proper arguments", () => {
        const callbackMock = vi.fn();
        const { getAllByRole } = renderWithProviders(<DecisionOverlay
            decisionCb={callbackMock}
            theirIndex={1}
            currentBet={0}
        />);
        const allButtons = getAllByRole("button");
        allButtons.forEach((button) => fireEvent.click(button));
        expect(callbackMock).toHaveBeenCalledTimes(3);
        expect(callbackMock).toHaveBeenCalledWith(1, "doubleDown");
        expect(callbackMock).toHaveBeenCalledWith(1, "stand");
        expect(callbackMock).toHaveBeenCalledWith(1, "hit");
    });
    it("blocks double down button if funds cannot afford it", () => {
        const { getByRole } = renderWithProviders(<DecisionOverlay
            decisionCb={defaultMock}
            theirIndex={1}
            currentBet={100}
        />, {
            preloadedState: {
                offlineUser: {
                    ...initialOfflineState,
                    balance: 50,
                },
            },
        });
        expect(getByRole("button", { name: "2x" })).toBeDisabled();
    });
});
