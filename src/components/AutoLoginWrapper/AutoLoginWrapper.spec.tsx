import { rest } from "msw";
import { setupServer } from "msw/node";
import React from "react";
import { waitFor } from "@testing-library/react";
import { renderWithProviders } from "../../utils/test-utils";
import { AutoLoginWrapper } from "./AutoLoginWrapper";
import { setupStore } from "../../mainStore";
import { initialOnlineUserState } from "../../App/onlineUserSlice";

const userData = {
    username: "test",
    id: 4,
    balance: 1001,
};
const TESTING_ROUTE = "http://localhost:5678/api/login/token";
const restServer = setupServer(
    rest.get(TESTING_ROUTE, (req, res, ctx) => {
        return res(ctx.delay(50), ctx.json(userData));
    }),
);

beforeAll(() => restServer.listen());
beforeEach(() => restServer.resetHandlers());
afterAll(() => restServer.close());

const MOCKED_STORE = setupStore({ onlineUser: { ...initialOnlineUserState } });
describe("AutoLoginWrapper", () => {
    beforeEach(() => {
        renderWithProviders(<AutoLoginWrapper />, { store: MOCKED_STORE });
    });
    it("should update global state on success", async () => {
        await waitFor(() => {
            expect(MOCKED_STORE.getState().onlineUser).toMatchObject(userData);
        });
    });
});
