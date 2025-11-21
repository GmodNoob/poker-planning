import { describe, it, expect } from "vitest";
import { isValidVote, isValidName, isValidRoomCode } from "./security.js";

describe("isValidVote", () => {
  it("accepts valid Fibonacci values", () => {
    expect(isValidVote(1)).toBe(true);
    expect(isValidVote(2)).toBe(true);
    expect(isValidVote(3)).toBe(true);
    expect(isValidVote(5)).toBe(true);
    expect(isValidVote(8)).toBe(true);
    expect(isValidVote(13)).toBe(true);
    expect(isValidVote(21)).toBe(true);
  });

  it("accepts special values", () => {
    expect(isValidVote("?")).toBe(true);
    expect(isValidVote("☕")).toBe(true);
  });

  it("accepts null (no vote)", () => {
    expect(isValidVote(null)).toBe(true);
  });

  it("rejects invalid values", () => {
    expect(isValidVote(0)).toBe(false);
    expect(isValidVote(4)).toBe(false);
    expect(isValidVote(100)).toBe(false);
    expect(isValidVote("invalid")).toBe(false);
    expect(isValidVote(undefined)).toBe(false);
    expect(isValidVote({})).toBe(false);
  });
});

describe("isValidName", () => {
  it("accepts valid names", () => {
    expect(isValidName("Alice")).toBe(true);
    expect(isValidName("A")).toBe(true);
    expect(isValidName("a".repeat(50))).toBe(true);
  });

  it("rejects empty names", () => {
    expect(isValidName("")).toBe(false);
  });

  it("rejects names over 50 characters", () => {
    expect(isValidName("a".repeat(51))).toBe(false);
  });

  it("rejects non-string values", () => {
    expect(isValidName(null)).toBe(false);
    expect(isValidName(undefined)).toBe(false);
    expect(isValidName(123)).toBe(false);
    expect(isValidName({})).toBe(false);
  });
});

describe("isValidRoomCode", () => {
  it("accepts valid 6-character alphanumeric codes", () => {
    expect(isValidRoomCode("ABCDEF")).toBe(true);
    expect(isValidRoomCode("123456")).toBe(true);
    expect(isValidRoomCode("ABC123")).toBe(true);
  });

  it("rejects codes with wrong length", () => {
    expect(isValidRoomCode("ABCDE")).toBe(false);
    expect(isValidRoomCode("ABCDEFG")).toBe(false);
    expect(isValidRoomCode("")).toBe(false);
  });

  it("rejects lowercase codes", () => {
    expect(isValidRoomCode("abcdef")).toBe(false);
  });

  it("rejects codes with special characters", () => {
    expect(isValidRoomCode("ABC-EF")).toBe(false);
    expect(isValidRoomCode("ABC EF")).toBe(false);
  });

  it("rejects non-string values", () => {
    expect(isValidRoomCode(null)).toBe(false);
    expect(isValidRoomCode(undefined)).toBe(false);
    expect(isValidRoomCode(123456)).toBe(false);
  });
});
