import { fireEvent, render } from "@testing-library/react";
import React from "react";
import { vi } from "vitest";
import { PresenterState } from "../../../../types/PresenterState.interface";
import { OfflinePresenterSection } from "./OfflinePresenterSection";
import deck from "../../../../cardDeck.json";
import { getCardValues } from "../../../../utils/getCardValues";

const defaultMock = vi.fn();
const testingCard = deck.deck[9];
const mockedPresenter: PresenterState = {
    cards: [testingCard],
    score: getCardValues(testingCard),
    didGetBlackjack: false,
};
describe("PresenterSection", () => {
    it("does not display start game btn if no players are seated", () => {
        const { queryByRole } = render(<OfflinePresenterSection
            isGameStarted={true}
            startGameCb={defaultMock}
            isAnyPlayerInSeat={false}
            presenter={mockedPresenter}
        />);
        expect(queryByRole("button", { name: "Start game" })).not.toBeInTheDocument();
    });
    it("fires callback when game is not started and button is clicked", () => {
        const callbackMock = vi.fn();
        const { getByRole } = render(<OfflinePresenterSection
            isGameStarted={false}
            startGameCb={callbackMock}
            isAnyPlayerInSeat={true}
            presenter={mockedPresenter}
        />);
        fireEvent.click(getByRole("button", { name: "Start game" }));
        expect(callbackMock).toHaveBeenCalledTimes(1);
    });
    it("displays proper presenter card and his score", () => {
        const { getByText, getByAltText } = render(<OfflinePresenterSection
            isGameStarted={true}
            startGameCb={defaultMock}
            isAnyPlayerInSeat={true}
            presenter={mockedPresenter}
        />);
        expect(getByAltText(`Card ${testingCard}`)).toBeInTheDocument();
        expect(getByText(`${mockedPresenter.score.join("/")}`));
    });
});
