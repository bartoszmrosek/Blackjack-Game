import { render } from "@testing-library/react";
import React from "react";
import { ImportantMessage } from "./ImportantMessage";

describe("Important message", () => {
    test("should display message based on prop", () => {
        const { getByText } = render(<ImportantMessage message="TEST" />);
        expect(getByText("TEST")).toBeInTheDocument();
    });
});
