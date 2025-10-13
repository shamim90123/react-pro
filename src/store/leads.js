// npm i zustand
import { create } from "zustand";

const todayISO = () => new Date().toISOString().slice(0, 10);

const sampleProducts = [
  "sams_pay",
  "sams_manage",
  "sams_platform",
  "sams_pay_client_management",
];

export const useLeadsStore = create((set) => ({
  leads: Array.from({ length: 25 }, (_, i) => {
    const flags = {
      sams_pay: i % 2 === 0,
      sams_manage: i % 3 === 0,
      sams_platform: i % 4 === 0,
      sams_pay_client_management: i % 5 === 0,
    };
    return {
      id: i + 1,
      name: `Lead ${i + 1}`,
      email: `lead${i + 1}@example.com`,
      firstname: `First${i + 1}`,
      lastname: `Last${i + 1}`,
      job_title: i % 2 ? "IT Manager" : "Admissions Lead",
      phone: `+8801${String(700000000 + i).slice(0, 9)}`,
      city: i % 2 ? "Dhaka" : "Chattogram",
      link: "https://example.com/profile",
      item_id: `ITM-${1000 + i}`,
      booked_demo: i % 4 === 0,
      comments: i % 3 === 0 ? "Interested in demo next week." : "",
      ...flags,
      created_at: `2025-10-${String((i % 28) + 1).padStart(2, "0")}`,
    };
  }),
  addLead: (lead) =>
    set((s) => ({
      leads: [
        {
          id: Date.now(),
          ...lead,
          created_at: todayISO(),
        },
        ...s.leads,
      ],
    })),
  deleteLead: (id) =>
    set((s) => ({
      leads: s.leads.filter((l) => l.id !== id),
    })),
}));
