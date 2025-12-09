import { describe, it, expect, beforeEach, vi } from "vitest";
import { RoomStorage } from "./storage.js";
import RedisMock from "ioredis-mock";

// Mock the redis module
vi.mock("./redis.js", () => {
  return {
    getRedisClient: () => new RedisMock(),
  };
});

describe("RoomStorage", () => {
  let storage: RoomStorage;

  beforeEach(async () => {
    storage = new RoomStorage();
    // Clear all keys before each test
    const redis = (storage as any).redis;
    await redis.flushall();
  });

  describe("createRoom", () => {
    it("creates a new room with default values", async () => {
      const room = await storage.createRoom("ABC123");

      expect(room.code).toBe("ABC123");
      expect(room.members.size).toBe(0);
      expect(room.showResults).toBe(false);
      expect(room.createdAt).toBeGreaterThan(0);
    });

    it("stores the room in Redis", async () => {
      await storage.createRoom("ABC123");
      const room = await storage.getRoom("ABC123");

      expect(room).not.toBeNull();
      expect(room?.code).toBe("ABC123");
    });
  });

  describe("getRoom", () => {
    it("retrieves an existing room", async () => {
      await storage.createRoom("ABC123");
      const room = await storage.getRoom("ABC123");

      expect(room).not.toBeNull();
      expect(room?.code).toBe("ABC123");
    });

    it("returns null for non-existent room", async () => {
      const room = await storage.getRoom("NONEXISTENT");
      expect(room).toBeNull();
    });

    it("deserializes members Map correctly", async () => {
      const room = await storage.createRoom("ABC123");
      room.members.set("user1", {
        id: "user1",
        name: "Alice",
        vote: 5,
        lastActivity: Date.now(),
      });
      await storage.updateRoom(room);

      const retrieved = await storage.getRoom("ABC123");
      expect(retrieved?.members.size).toBe(1);
      expect(retrieved?.members.get("user1")?.name).toBe("Alice");
    });
  });

  describe("updateRoom", () => {
    it("updates an existing room", async () => {
      const room = await storage.createRoom("ABC123");
      room.showResults = true;
      await storage.updateRoom(room);

      const updated = await storage.getRoom("ABC123");
      expect(updated?.showResults).toBe(true);
    });

    it("preserves TTL when updating", async () => {
      await storage.createRoom("ABC123");

      // Get initial TTL
      const redis = (storage as any).redis;
      const ttlBefore = await redis.ttl("room:ABC123");

      // Update room
      const room = await storage.getRoom("ABC123");
      if (room) {
        room.showResults = true;
        await storage.updateRoom(room);
      }

      // TTL should be preserved (approximately)
      const ttlAfter = await redis.ttl("room:ABC123");
      expect(ttlAfter).toBeGreaterThan(0);
      expect(Math.abs(ttlBefore - ttlAfter)).toBeLessThan(2);
    });
  });

  describe("deleteRoom", () => {
    it("deletes an existing room", async () => {
      await storage.createRoom("ABC123");
      await storage.deleteRoom("ABC123");

      const room = await storage.getRoom("ABC123");
      expect(room).toBeNull();
    });

    it("does not throw when deleting non-existent room", async () => {
      await expect(storage.deleteRoom("NONEXISTENT")).resolves.not.toThrow();
    });
  });

  describe("roomExists", () => {
    it("returns true for existing room", async () => {
      await storage.createRoom("ABC123");
      const exists = await storage.roomExists("ABC123");
      expect(exists).toBe(true);
    });

    it("returns false for non-existent room", async () => {
      const exists = await storage.roomExists("NONEXISTENT");
      expect(exists).toBe(false);
    });
  });

  describe("cleanupInactiveMembers", () => {
    it("removes inactive members from rooms", async () => {
      const room = await storage.createRoom("ABC123");
      const now = Date.now();

      // Add active and inactive members
      room.members.set("active", {
        id: "active",
        name: "Active User",
        vote: null,
        lastActivity: now,
      });
      room.members.set("inactive", {
        id: "inactive",
        name: "Inactive User",
        vote: null,
        lastActivity: now - 10 * 60 * 1000, // 10 minutes ago
      });

      await storage.updateRoom(room);

      // Cleanup with 5 minute timeout
      await storage.cleanupInactiveMembers(5 * 60 * 1000);

      const updated = await storage.getRoom("ABC123");
      expect(updated?.members.size).toBe(1);
      expect(updated?.members.has("active")).toBe(true);
      expect(updated?.members.has("inactive")).toBe(false);
    });

    it("deletes rooms with no active members (after grace period)", async () => {
      const room = await storage.createRoom("ABC123");
      const now = Date.now();

      // Set room creation time to be older than grace period (6 minutes ago)
      room.createdAt = now - 6 * 60 * 1000;

      room.members.set("inactive1", {
        id: "inactive1",
        name: "Inactive User 1",
        vote: null,
        lastActivity: now - 10 * 60 * 1000,
      });
      room.members.set("inactive2", {
        id: "inactive2",
        name: "Inactive User 2",
        vote: null,
        lastActivity: now - 10 * 60 * 1000,
      });

      await storage.updateRoom(room);
      await storage.cleanupInactiveMembers(5 * 60 * 1000);

      const deleted = await storage.getRoom("ABC123");
      expect(deleted).toBeNull();
    });

    it("does NOT delete empty rooms within grace period", async () => {
      const room = await storage.createRoom("ABC123");
      const now = Date.now();

      // Room created recently (within grace period)
      room.createdAt = now - 2 * 60 * 1000; // 2 minutes ago

      // Add and then remove all members to make room empty
      room.members.set("user1", {
        id: "user1",
        name: "User 1",
        vote: null,
        lastActivity: now - 10 * 60 * 1000, // Inactive
      });

      await storage.updateRoom(room);
      await storage.cleanupInactiveMembers(5 * 60 * 1000);

      // Room should still exist because it's within grace period
      const stillExists = await storage.getRoom("ABC123");
      expect(stillExists).not.toBeNull();
      expect(stillExists?.code).toBe("ABC123");
      expect(stillExists?.members.size).toBe(0); // Members removed but room kept
    });

    it("does not remove active members", async () => {
      const room = await storage.createRoom("ABC123");
      const now = Date.now();

      room.members.set("active", {
        id: "active",
        name: "Active User",
        vote: null,
        lastActivity: now - 2 * 60 * 1000, // 2 minutes ago
      });

      await storage.updateRoom(room);
      await storage.cleanupInactiveMembers(5 * 60 * 1000);

      const updated = await storage.getRoom("ABC123");
      expect(updated?.members.size).toBe(1);
    });

    it("handles multiple rooms", async () => {
      const now = Date.now();

      // Room 1 - has active members
      const room1 = await storage.createRoom("ROOM001");
      room1.members.set("active", {
        id: "active",
        name: "Active",
        vote: null,
        lastActivity: now,
      });
      await storage.updateRoom(room1);

      // Room 2 - all inactive, created 6 minutes ago (past grace period)
      const room2 = await storage.createRoom("ROOM002");
      room2.createdAt = now - 6 * 60 * 1000; // 6 minutes ago
      room2.members.set("inactive", {
        id: "inactive",
        name: "Inactive",
        vote: null,
        lastActivity: now - 10 * 60 * 1000,
      });
      await storage.updateRoom(room2);

      await storage.cleanupInactiveMembers(5 * 60 * 1000);

      const room1Updated = await storage.getRoom("ROOM001");
      const room2Updated = await storage.getRoom("ROOM002");

      expect(room1Updated).not.toBeNull();
      expect(room2Updated).toBeNull();
    });
  });
});
