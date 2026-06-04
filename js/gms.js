// --- FITWITHKHEMU GMS BUSINESS LOGIC ---

const WORKOUT_PLANS = {
  "5-Day Split": [
    { name: "Chest & Triceps Focus", reps: "4 Sets x 10-12 Reps", icon: "fa-dumbbell" },
    { name: "Back & Biceps Pull Work", reps: "4 Sets x 8-10 Reps", icon: "fa-bolt" },
    { name: "Shoulders & Core Press", reps: "3 Sets x 12 Reps", icon: "fa-dumbbell" },
    { name: "Heavy Quad & Hamstring Day", reps: "4 Sets x 10 Reps", icon: "fa-person-walking" },
    { name: "Arms Conditioning & Abs", reps: "3 Sets x 15 Reps", icon: "fa-chart-line" }
  ],
  "Push-Pull-Legs": [
    { name: "Push: Chest, Shoulders & Tri", reps: "4 Sets x 8-12 Reps", icon: "fa-dumbbell" },
    { name: "Pull: Back, Traps & Bi", reps: "4 Sets x 8-12 Reps", icon: "fa-bolt" },
    { name: "Legs: Squats & Calves", reps: "4 Sets x 10-15 Reps", icon: "fa-person-walking" }
  ],
  "3-Day Split": [
    { name: "Full Body A (Compound Focus)", reps: "3 Sets x 8-10 Reps", icon: "fa-dumbbell" },
    { name: "Full Body B (Hypertrophy)", reps: "3 Sets x 10-12 Reps", icon: "fa-bolt" },
    { name: "Full Body C (Metabolic Pump)", reps: "3 Sets x 15 Reps", icon: "fa-chart-line" }
  ],
  "3-Day Split for Women": [
    { name: "Lower Body & Glutes Sculpt", reps: "3 Sets x 12-15 Reps", icon: "fa-person-walking" },
    { name: "Upper Body & Arms Tone", reps: "3 Sets x 10-12 Reps", icon: "fa-dumbbell" },
    { name: "Full Body Conditioning & Core", reps: "3 Sets x 15 Reps", icon: "fa-bolt" }
  ]
};

class GymManagementSystem {
  constructor() {
    this.initDatabase();
  }

  initDatabase() {
    // Seed default clients if not present
    if (!localStorage.getItem("fwk_clients")) {
      // DEFAULT_CLIENTS will feed from here initially
      const initialClients = [
        {
          id: "c-101",
          name: "Raj Patel",
          email: "raj.patel@gmail.com",
          phone: "+91 98765 43210",
          goal: "Muscle Gain",
          plan: "5-Day Split",
          membership: "Platinum",
          status: "active",
          joinedDate: "2026-03-15",
          expiryDate: "2026-09-15",
          weight: 78,
          height: 178,
          dailyIntake: 2800,
          dailyLog: { workout: true, cardio: false, meals: true, water: true }
        },
        {
          id: "c-102",
          name: "Vikram Singh",
          email: "vikram.singh@yahoo.in",
          phone: "+91 99887 76655",
          goal: "Fat Loss",
          plan: "Push-Pull-Legs",
          membership: "Gold",
          status: "active",
          joinedDate: "2026-04-10",
          expiryDate: "2026-07-10",
          weight: 92,
          height: 182,
          dailyIntake: 2100,
          dailyLog: { workout: true, cardio: true, meals: true, water: false }
        },
        {
          id: "c-103",
          name: "Ananya Sharma",
          email: "ananya.sharma@outlook.com",
          phone: "+91 91234 56789",
          goal: "Lean Conditioning",
          plan: "3-Day Split",
          membership: "Silver",
          status: "pending",
          joinedDate: "2026-05-28",
          expiryDate: "2026-06-28",
          weight: 58,
          height: 164,
          dailyIntake: 1700,
          dailyLog: { workout: false, cardio: false, meals: false, water: false }
        },
        {
          id: "c-104",
          name: "Priya Iyer",
          email: "priya.iyer@gmail.com",
          phone: "+91 98989 89898",
          goal: "General Fitness",
          plan: "3-Day Split for Women",
          membership: "Gold",
          status: "expired",
          joinedDate: "2025-11-20",
          expiryDate: "2026-05-20",
          weight: 64,
          height: 168,
          dailyIntake: 1900,
          dailyLog: { workout: false, cardio: false, meals: false, water: false }
        }
      ];
      localStorage.setItem("fwk_clients", JSON.stringify(initialClients));
    }
  }

  getClients() {
    return window.DB.getLocalClients();
  }

  saveClients(clients) {
    window.DB.saveClients(clients);
  }

  getClientById(id) {
    const clients = this.getClients();
    return clients.find(c => c.id === id);
  }

  getClientByEmail(email) {
    const clients = this.getClients();
    return clients.find(c => c.email.toLowerCase() === email.toLowerCase());
  }

  addClient(clientData) {
    const clients = this.getClients();
    const newClient = {
      id: "c-" + Date.now(),
      name: clientData.name,
      email: clientData.email,
      phone: clientData.phone || "+91 99999 99999",
      goal: clientData.goal || "General Fitness",
      plan: clientData.plan || "3-Day Split",
      membership: clientData.membership || "Silver",
      status: clientData.status || "active",
      joinedDate: new Date().toISOString().split('T')[0],
      expiryDate: this.calculateExpiry(clientData.membership),
      weight: parseFloat(clientData.weight) || 70,
      height: parseFloat(clientData.height) || 170,
      dailyIntake: parseInt(clientData.dailyIntake) || 2000,
      dailyLog: { workout: false, cardio: false, meals: false, water: false }
    };
    clients.push(newClient);
    this.saveClients(clients);
    return newClient;
  }

  calculateExpiry(membership) {
    const date = new Date();
    if (membership === "Platinum") {
      date.setMonth(date.getMonth() + 6);
    } else if (membership === "Gold") {
      date.setMonth(date.getMonth() + 3);
    } else {
      date.setMonth(date.getMonth() + 1);
    }
    return date.toISOString().split('T')[0];
  }

  updateClientWorkout(id, planName) {
    const clients = this.getClients();
    const client = clients.find(c => c.id === id);
    if (client) {
      client.plan = planName;
      this.saveClients(clients);
      return true;
    }
    return false;
  }

  updateClientStatus(id, status) {
    const clients = this.getClients();
    const client = clients.find(c => c.id === id);
    if (client) {
      client.status = status;
      this.saveClients(clients);
      return true;
    }
    return false;
  }

  deleteClient(id) {
    let clients = this.getClients();
    clients = clients.filter(c => c.id !== id);
    this.saveClients(clients);

    // Free any slots booked by this client
    const slots = window.DB.getLocalSlots();
    slots.forEach(s => {
      if (s.bookedBy === id) {
        window.DB.freeSlot(s.id);
      }
    });

    return true;
  }

  updateDailyLog(clientId, key, val) {
    const clients = this.getClients();
    const client = clients.find(c => c.id === clientId);
    if (client) {
      if (!client.dailyLog) {
        client.dailyLog = { workout: false, cardio: false, meals: false, water: false };
      }
      client.dailyLog[key] = val;
      this.saveClients(clients);
      return client.dailyLog;
    }
    return null;
  }

  getDashboardStats() {
    const clients = this.getClients();
    const total = clients.length;
    const active = clients.filter(c => c.status === "active").length;
    const pending = clients.filter(c => c.status === "pending").length;
    
    let totalRevenue = 0;
    clients.forEach(c => {
      if (c.status === "active") {
        if (c.membership === "Silver") totalRevenue += 1999;
        else if (c.membership === "Gold") totalRevenue += 4999;
        else if (c.membership === "Platinum") totalRevenue += 8999;
      }
    });

    return {
      total,
      active,
      pending,
      revenue: totalRevenue
    };
  }

  getWorkoutDetails(planName) {
    return WORKOUT_PLANS[planName] || WORKOUT_PLANS["3-Day Split"];
  }

  // --- TIME SLOTS BUSINESS WRAPPERS ---
  getSlots() {
    return window.DB.getLocalSlots();
  }

  assignClientSlot(slotId, clientId) {
    const client = this.getClientById(clientId);
    if (client) {
      return window.DB.assignSlot(slotId, clientId, client.name);
    }
    return false;
  }

  freeClientSlot(slotId) {
    return window.DB.freeSlot(slotId);
  }

  getClientSlot(clientId) {
    const slots = this.getSlots();
    return slots.find(s => s.bookedBy === clientId) || null;
  }

  // --- SESSION CONTROLLER ---
  login(username, password) {
    if (username.toLowerCase() === "khemu" && password === "trainer123") {
      const session = { type: "trainer", user: { name: "Khemu Trainer", role: "admin" } };
      localStorage.setItem("fwk_session", JSON.stringify(session));
      return session;
    }
    
    const client = this.getClientByEmail(username);
    if (client && password === "client123") {
      const session = { type: "client", user: client };
      localStorage.setItem("fwk_session", JSON.stringify(session));
      return session;
    }
    return null;
  }

  logout() {
    localStorage.removeItem("fwk_session");
  }

  getCurrentSession() {
    return JSON.parse(localStorage.getItem("fwk_session")) || null;
  }
}

const GMS = new GymManagementSystem();
window.GMS = GMS;
