import { fireEvent } from "@testing-library/react";
import React from "react";
import { renderWithProviders } from "../../../utils/test-utils";
import { UserInformations } from "./UserInformations";

describe("UserInformations", () => {
    it("routes to logout page on logout button click", () => {
        const { getByRole } = renderWithProviders(<UserInformations username="Kot" />);
        fireEvent.click(getByRole("link"));
        expect(window.location.pathname).toBe("/logout");
    });
});
