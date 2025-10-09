// npm i zustand
import { create } from "zustand";

const STATUSES = ["New", "Contacted", "Qualified", "Won", "Lost"];

export const useLeadsStore = create((set) => ({
  leads: Array.from({ length: 100 }, (_, i) => ({
    id: i + 1,
    name: `Lead ${i + 1}`,
    email: `lead${i + 1}@example.com`,
    status: STATUSES[i % STATUSES.length],
    date: `2025-10-${String((i % 28) + 1).padStart(2, "0")}`,
  })),
  addLead: (lead) =>
    set((s) => ({ leads: [{ id: Date.now(), ...lead }, ...s.leads] })),
}));
