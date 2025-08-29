// src/setupTests.ts (for Vitest)
import "@testing-library/jest-dom";
import { cleanup } from "@testing-library/react";
import { beforeAll, afterAll, vi } from "vitest";

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

// Global test setup
beforeAll(() => {
  // Any global setup
});

afterAll(() => {
  // Any global cleanup
  cleanup();
  vi.clearAllMocks();
});

// Make vi globally available (optional, but convenient)
// global.vi = vi;
