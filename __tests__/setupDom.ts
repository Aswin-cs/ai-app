import { JSDOM } from "jsdom";

// Ensure environment variables are populated before any config module imports
process.env.GEMINI_API_KEY = process.env.GEMINI_API_KEY || "test-gemini-api-key";

const dom = new JSDOM("<!DOCTYPE html><html><body></body></html>", {
  url: "http://localhost:3000",
});

const globalTarget = globalThis as unknown as Record<string, unknown>;

globalTarget.window = dom.window;
globalTarget.document = dom.window.document;
globalTarget.navigator = dom.window.navigator;
globalTarget.HTMLElement = dom.window.HTMLElement;
globalTarget.HTMLButtonElement = dom.window.HTMLButtonElement;
globalTarget.KeyboardEvent = dom.window.KeyboardEvent;

// Intercept relative fetch URLs in node environment to prevent undici URL parse errors
const origFetch = globalThis.fetch;
if (origFetch) {
  globalThis.fetch = function (input: RequestInfo | URL, init?: RequestInit) {
    if (typeof input === "string" && input.startsWith("/")) {
      input = "http://localhost:3000" + input;
    }
    return origFetch(input, init);
  } as typeof fetch;
}
