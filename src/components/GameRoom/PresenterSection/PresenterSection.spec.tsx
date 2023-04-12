import { fireEvent, render } from "@testing-library/react";
import React from "react";
import { vi } from "vitest";
import { PresenterState } from "../../../types/PresenterState";
import { PresenterSection } from "./PresenterSection";
import deck from "../../../cardDeck.json";
import { getCardValues } from "../../../utils/getCardValues";

const defaultMock = vi.fn();
const testingCard = deck.deck[9];
const mockedPresenter: PresenterState = {
    cards: [testingCard],
    score: getCardValues(testingCard),
};
describe("PresenterSection", () => {
    it("fires callback when game is not started and button is clicked", () => {
        const callbackMock = vi.fn();
        const { getByRole } = render(<PresenterSection
            isGameStarted={false}
            startGameCb={callbackMock}
            presenter={mockedPresenter}
        />);
        fireEvent.click(getByRole("button", { name: "Start game" }));
        expect(callbackMock).toHaveBeenCalledTimes(1);
    });
    it("displays proper presenter card and his score", () => {
        const { getByText, getByAltText } = render(<PresenterSection
            isGameStarted={true}
            startGameCb={defaultMock}
            presenter={mockedPresenter}
        />);
        expect(getByAltText(`Card ${testingCard}`)).toBeInTheDocument();
        expect(getByText(`${mockedPresenter.score.join("/")}`));
    });
});
