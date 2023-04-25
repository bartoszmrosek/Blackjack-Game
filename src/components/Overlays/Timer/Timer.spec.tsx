import { vi } from "vitest";
import React from "react";
import { act, cleanup, screen } from "@testing-library/react";
import { renderWithProviders } from "../../../utils/test-utils";
import { Timer } from "./Timer";

describe("Timer", () => {
    beforeEach(() => {
        vi.useFakeTimers();
        renderWithProviders(<Timer maxTime={10} />);
        return () => vi.useRealTimers();
    });
    it("expect timer to countdown from initial prop", () => {
        act(() => {
            vi.advanceTimersToNextTimer();
        });
        expect(screen.getByText("0:09")).toBeInTheDocument();
    });
    it("should display proper description without overwrite props", () => {
        expect(screen.getByText("Time for action:")).toBeInTheDocument();
    });
    it("should display proper description with overwrite props", () => {
        cleanup();
        renderWithProviders(<Timer maxTime={10} descriptionOverwrite="TEST" />);
        expect(screen.getByRole("heading", { name: "TEST" })).toBeInTheDocument();
    });
});
