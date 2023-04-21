import { expect, afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
import matchers from "@testing-library/jest-dom/matchers";

import nodeFetch, { Request, Response } from "node-fetch";

//@ts-ignore
global.fetch = nodeFetch;
//@ts-ignore
global.Request = Request;
//@ts-ignore
global.Response = Response;

expect.extend(matchers);

afterEach(() => {
  cleanup();
});
