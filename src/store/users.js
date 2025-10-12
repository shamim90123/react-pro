// npm i zustand
import { create } from "zustand";

const STATUSES = ["New", "Contacted", "Qualified", "Won", "Lost"];

export const useUsersStore = create((set) => ({
  users: Array.from({ length: 100 }, (_, i) => ({
    id: i + 1,
    name: `User ${i + 1}`,
    email: `user${i + 1}@example.com`,
    status: STATUSES[i % STATUSES.length],
    date: `2025-10-${String((i % 28) + 1).padStart(2, "0")}`,
  })),
  addUser: (user) =>
    set((s) => ({ users: [{ id: Date.now(), ...user }, ...s.users] })),
}));
