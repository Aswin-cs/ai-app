import { JSDOM } from "jsdom";

// Ensure environment variables are populated before any config module imports
process.env.GEMINI_API_KEY = process.env.GEMINI_API_KEY || "test-gemini-api-key";

const dom = new JSDOM("<!DOCTYPE html><html><body></body></html>", {
  url: "http://localhost:3000",
});

(globalThis as any).window = dom.window;
(globalThis as any).document = dom.window.document;
(globalThis as any).navigator = dom.window.navigator;
(globalThis as any).HTMLElement = dom.window.HTMLElement;
(globalThis as any).HTMLButtonElement = dom.window.HTMLButtonElement;
(globalThis as any).KeyboardEvent = dom.window.KeyboardEvent;

// Intercept relative fetch URLs in node environment to prevent undici URL parse errors
const origFetch = globalThis.fetch;
if (origFetch) {
  globalThis.fetch = function (input: any, init?: any) {
    if (typeof input === "string" && input.startsWith("/")) {
      input = "http://localhost:3000" + input;
    }
    return origFetch(input, init);
  } as any;
}
