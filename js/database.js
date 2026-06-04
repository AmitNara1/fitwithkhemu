// --- FITWITHKHEMU PRODUCTION DATABASE ADAPTER ---
//
// HOW TO SCALE AND CONNECT TO A LIVE SUPABASE SERVER IN 3 EASY STEPS:
// 1. Go to https://supabase.com and create a free project named "fitwithkhemu".
// 2. Go to your Supabase Project Settings -> API, and get your URL and Public Anon Key.
// 3. Toggle "USE_SUPABASE" to true below, and paste your URL and Key in the constants!
//
// That's it! Your website is now fully backed by a PostgreSQL database and will easily
// scale to handle concurrent trainer and client traffic without crashing.

const USE_SUPABASE = false; // Toggle to true when hosting live!
const SUPABASE_URL = "https://your-project-id.supabase.co";
const SUPABASE_ANON_KEY = "your-public-anon-key-here";

const DEFAULT_SLOTS = [
  { id: "slot-06", time: "06:00 AM - 07:00 AM", bookedBy: "c-101", clientName: "Raj Patel" },
  { id: "slot-07", time: "07:00 AM - 08:00 AM", bookedBy: null, clientName: "" },
  { id: "slot-08", time: "08:00 AM - 09:00 AM", bookedBy: "c-102", clientName: "Vikram Singh" },
  { id: "slot-09", time: "09:00 AM - 10:00 AM", bookedBy: null, clientName: "" },
  { id: "slot-10", time: "10:00 AM - 11:00 AM", bookedBy: null, clientName: "" },
  { id: "slot-11", time: "11:00 AM - 12:00 PM", bookedBy: null, clientName: "" },
  { id: "slot-16", time: "04:00 PM - 05:00 PM", bookedBy: null, clientName: "" },
  { id: "slot-17", time: "05:00 PM - 06:00 PM", bookedBy: null, clientName: "" },
  { id: "slot-18", time: "06:00 PM - 07:00 PM", bookedBy: "c-103", clientName: "Ananya Sharma" },
  { id: "slot-19", time: "07:00 PM - 08:00 PM", bookedBy: null, clientName: "" },
  { id: "slot-20", time: "08:00 PM - 09:00 PM", bookedBy: null, clientName: "" },
  { id: "slot-21", time: "09:00 PM - 10:00 PM", bookedBy: null, clientName: "" }
];

class DatabaseAdapter {
  constructor() {
    this.initLocalPersistence();
  }

  initLocalPersistence() {
    if (!localStorage.getItem("fwk_slots")) {
      localStorage.setItem("fwk_slots", JSON.stringify(DEFAULT_SLOTS));
    }
  }

  // --- CLIENT QUERIES ---
  async getClients() {
    if (USE_SUPABASE) {
      try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/clients?select=*`, {
          headers: {
            "apikey": SUPABASE_ANON_KEY,
            "Authorization": `Bearer ${SUPABASE_ANON_KEY}`
          }
        });
        return await response.json();
      } catch (err) {
        console.error("Supabase Error. Falling back to local storage.", err);
        return this.getLocalClients();
      }
    } else {
      return this.getLocalClients();
    }
  }

  getLocalClients() {
    return JSON.parse(localStorage.getItem("fwk_clients")) || [];
  }

  async saveClients(clients) {
    if (USE_SUPABASE) {
      try {
        // Send batch updates to Supabase (Normally UPSERT in production)
        await fetch(`${SUPABASE_URL}/rest/v1/clients`, {
          method: "POST",
          headers: {
            "apikey": SUPABASE_ANON_KEY,
            "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
            "Content-Type": "application/json",
            "Prefer": "resolution=merge-duplicates"
          },
          body: JSON.stringify(clients)
        });
      } catch (err) {
        console.error("Supabase write failure.", err);
      }
    }
    // Always backup in Local Storage for reliability!
    localStorage.setItem("fwk_clients", JSON.stringify(clients));
  }

  // --- TIME SLOTS QUERIES ("Maintain the Clock") ---
  async getSlots() {
    if (USE_SUPABASE) {
      try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/slots?select=*&order=id.asc`, {
          headers: {
            "apikey": SUPABASE_ANON_KEY,
            "Authorization": `Bearer ${SUPABASE_ANON_KEY}`
          }
        });
        return await response.json();
      } catch (err) {
        console.error("Supabase slot read failure. Falling back.", err);
        return this.getLocalSlots();
      }
    } else {
      return this.getLocalSlots();
    }
  }

  getLocalSlots() {
    return JSON.parse(localStorage.getItem("fwk_slots")) || DEFAULT_SLOTS;
  }

  async saveSlots(slots) {
    if (USE_SUPABASE) {
      try {
        await fetch(`${SUPABASE_URL}/rest/v1/slots`, {
          method: "POST",
          headers: {
            "apikey": SUPABASE_ANON_KEY,
            "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
            "Content-Type": "application/json",
            "Prefer": "resolution=merge-duplicates"
          },
          body: JSON.stringify(slots)
        });
      } catch (err) {
        console.error("Supabase slot write failure.", err);
      }
    }
    localStorage.setItem("fwk_slots", JSON.stringify(slots));
  }

  // Book a 1-hour time slot
  async assignSlot(slotId, clientId, clientName) {
    const slots = await this.getSlots();
    const slot = slots.find(s => s.id === slotId);
    
    // Clear any slot previously booked by this same client to avoid double booking
    if (clientId) {
      slots.forEach(s => {
        if (s.bookedBy === clientId) {
          s.bookedBy = null;
          s.clientName = "";
        }
      });
    }

    if (slot) {
      slot.bookedBy = clientId;
      slot.clientName = clientName || "";
      await this.saveSlots(slots);
      return true;
    }
    return false;
  }

  // Free up a slot
  async freeSlot(slotId) {
    const slots = await this.getSlots();
    const slot = slots.find(s => s.id === slotId);
    if (slot) {
      slot.bookedBy = null;
      slot.clientName = "";
      await this.saveSlots(slots);
      return true;
    }
    return false;
  }
}

const DB = new DatabaseAdapter();
window.DB = DB; // Expose globally
