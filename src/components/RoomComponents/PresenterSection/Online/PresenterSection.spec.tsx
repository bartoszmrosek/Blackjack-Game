import React from "react";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../../../utils/test-utils";
import { PresenterSection } from "./PresenterSection";
import deck from "../../../../cardDeck.json";
import { getCardValues } from "../../../../utils/getCardValues";
import { PresenterState } from "../../../../types/PresenterState.interface";

const testingCard = deck.deck[9];
const mockedPresenter: PresenterState = {
    cards: [testingCard],
    score: getCardValues(testingCard),
    didGetBlackjack: false,
};
describe("PresenterSection", () => {
    beforeEach(() => {
        renderWithProviders(<PresenterSection presenter={mockedPresenter} />);
    });
    it("should display proper card for presenter", () => {
        expect(screen.getByAltText(`Card ${testingCard}`)).toBeInTheDocument();
        expect(screen.getByText(`${mockedPresenter.score.join("/")}`));
    });
});
