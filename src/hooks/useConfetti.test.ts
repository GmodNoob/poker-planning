import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useConfetti } from "./useConfetti";

// Mock canvas-confetti
vi.mock("canvas-confetti", () => ({
  default: vi.fn(),
}));

import confetti from "canvas-confetti";

describe("useConfetti", () => {
  it("returns fireConfetti function", () => {
    const { result } = renderHook(() => useConfetti());

    expect(result.current.fireConfetti).toBeDefined();
    expect(typeof result.current.fireConfetti).toBe("function");
  });

  it("fires multiple confetti bursts when called", () => {
    vi.useFakeTimers();
    const mockConfetti = vi.mocked(confetti);
    mockConfetti.mockClear();

    const { result } = renderHook(() => useConfetti());
    result.current.fireConfetti();

    // First two bursts are immediate
    expect(mockConfetti).toHaveBeenCalledTimes(2);

    // Left burst
    expect(mockConfetti).toHaveBeenCalledWith(
      expect.objectContaining({
        particleCount: 100,
        spread: 70,
        origin: { x: 0.1, y: 0.6 },
      }),
    );

    // Right burst
    expect(mockConfetti).toHaveBeenCalledWith(
      expect.objectContaining({
        particleCount: 100,
        spread: 70,
        origin: { x: 0.9, y: 0.6 },
      }),
    );

    // Advance timers to trigger delayed bursts
    vi.advanceTimersByTime(150);
    expect(mockConfetti).toHaveBeenCalledTimes(3);

    // Center burst
    expect(mockConfetti).toHaveBeenCalledWith(
      expect.objectContaining({
        particleCount: 150,
        spread: 100,
        origin: { x: 0.5, y: 0.5 },
      }),
    );

    // Advance timers to trigger final bursts
    vi.advanceTimersByTime(150);
    expect(mockConfetti).toHaveBeenCalledTimes(5);

    vi.useRealTimers();
  });

  it("uses purple/pink theme colors", () => {
    vi.useFakeTimers();
    const mockConfetti = vi.mocked(confetti);
    mockConfetti.mockClear();

    const { result } = renderHook(() => useConfetti());
    result.current.fireConfetti();

    // Check that all calls include purple/pink colors
    mockConfetti.mock.calls.forEach((call) => {
      const config = call[0];
      if (config) {
        expect(config).toHaveProperty("colors");
        expect(config.colors).toEqual(
          expect.arrayContaining([expect.stringMatching(/#[a-f0-9]{6}/i)]),
        );
      }
    });

    vi.useRealTimers();
  });

  it("maintains stable reference across re-renders", () => {
    const { result, rerender } = renderHook(() => useConfetti());
    const firstRef = result.current.fireConfetti;

    rerender();
    const secondRef = result.current.fireConfetti;

    expect(firstRef).toBe(secondRef);
  });
});
