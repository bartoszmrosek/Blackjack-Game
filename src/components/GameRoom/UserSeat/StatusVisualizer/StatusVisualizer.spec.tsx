import { render } from "@testing-library/react";
import React from "react";
import { StatusVisualizer } from "./StatusVisualizer";

describe("StatusVisualizer", () => {
    it("displays blackjack logo on blackjack status", () => {
        const { getByAltText, getByText } = render(<StatusVisualizer status="blackjack" />);
        expect(getByAltText("User blackjack icon")).toBeInTheDocument();
        expect(getByText("BLACKJACK")).toBeInTheDocument();
    });
    it("displays win logo on win status", () => {
        const { getByAltText, getByText } = render(<StatusVisualizer status="won" />);
        expect(getByAltText("User won icon")).toBeInTheDocument();
        expect(getByText("WIN")).toBeInTheDocument();
    });
    it("displays lose logo on lost status", () => {
        const { getByAltText, getByText } = render(<StatusVisualizer status="lost" />);
        expect(getByAltText("User lost icon")).toBeInTheDocument();
        expect(getByText("LOSE")).toBeInTheDocument();
    });
    it("displays busted logo on bust status", () => {
        const { getByAltText, getByText } = render(<StatusVisualizer status="bust" />);
        expect(getByAltText("User bust icon")).toBeInTheDocument();
        expect(getByText("BUST")).toBeInTheDocument();
    });
});
