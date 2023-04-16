import { fireEvent } from "@testing-library/react";
import React from "react";
import { renderWithProviders } from "../../utils/test-utils";
import { GoBackButton } from "./GoBackButton";

describe("GoBackButton", () => {
    it("should go to previous page on click", () => {
        const { getByRole } = renderWithProviders(<GoBackButton />, { route: "/credits" });
        const goBackBtn = getByRole("button");
        fireEvent.click(goBackBtn);
        expect(window.location.pathname).toBe("/");
    });
});
