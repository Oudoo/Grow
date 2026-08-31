import { describe, it, expect } from "vitest";
import { isConnectionFailure } from "./db-errors";

describe("isConnectionFailure", () => {
  it("recognises the codes a dead pool produces", () => {
    for (const code of ["P1000", "P1001", "P1002", "P1008", "P1017", "P2024"]) {
      expect(isConnectionFailure({ code })).toBe(true);
    }
  });

  it("recognises a failed initialisation, which is what a grant change causes", () => {
    expect(isConnectionFailure({ name: "PrismaClientInitializationError" })).toBe(true);
    expect(
      isConnectionFailure({ message: "Authentication failed against database server" }),
    ).toBe(true);
  });

  it("recognises driver-level socket failures with no Prisma code", () => {
    expect(isConnectionFailure({ message: "read ECONNRESET" })).toBe(true);
    // mysql2's wording when the server drops the socket — a dead connection,
    // so it must be recoverable.
    expect(isConnectionFailure({ message: "This socket has been ended by the other party" })).toBe(true);
    expect(isConnectionFailure({ message: "socket hang up" })).toBe(true);
    expect(isConnectionFailure({ message: "connect ECONNREFUSED 127.0.0.1:3306" })).toBe(true);
    expect(isConnectionFailure({ message: "Server has closed the connection." })).toBe(true);
  });

  it("does NOT treat query errors as connection failures", () => {
    // Retrying these would fail identically and bury the real cause.
    expect(isConnectionFailure({ code: "P2002" })).toBe(false); // unique constraint
    expect(isConnectionFailure({ code: "P2003" })).toBe(false); // foreign key
    expect(isConnectionFailure({ code: "P2025" })).toBe(false); // record not found
    expect(isConnectionFailure({ code: "P2021" })).toBe(false); // table does not exist
    expect(isConnectionFailure({ message: "Unique constraint failed on the fields: (`email`)" })).toBe(false);
  });

  it("handles null, undefined and shapeless throws", () => {
    expect(isConnectionFailure(null)).toBe(false);
    expect(isConnectionFailure(undefined)).toBe(false);
    expect(isConnectionFailure({})).toBe(false);
    expect(isConnectionFailure("a bare string")).toBe(false);
  });
});
