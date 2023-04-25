import { vi } from "vitest";
import React from "react";
import { act, screen } from "@testing-library/react";
import { renderWithProviders } from "../../../utils/test-utils";
import { Timer } from "./Timer";

test("aa", () => {
    vi.useFakeTimers();
    renderWithProviders(<Timer maxTime={10} />);

    act(() => {
        vi.advanceTimersByTime(1500);
    });

    expect(screen.getByText("0:09"));
});
