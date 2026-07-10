// --- FITWITHKHEMU CLIENT APP ENGINE ---

class AppController {
  constructor() {
    this.currentGender = "male";
    this.selectedPlanName = "";
    this.selectedPlanPrice = 0;
    this.selectedGmsClientId = null; // Track currently selected client in Trainer GMS view
    this.activeTrainerTab = "clients"; // Track GMS sub-tab: 'clients' or 'slots'
    this.initListeners();
  }

  // Dismiss Loading Overlay (FitnessTalks style)
  dismissLoader() {
    const loader = document.getElementById("appLoader");
    if (loader) {
      loader.style.opacity = "0";
      setTimeout(() => {
        loader.style.display = "none";
      }, 600);
    }
  }

  initListeners() {
    // Scroll header background transition
    window.addEventListener("scroll", () => {
      const header = document.getElementById("navHeader");
      if (window.scrollY > 50) {
        header.classList.add("scrolled");
      } else {
        header.classList.remove("scrolled");
      }
    });

    // Handle initial state on load
    window.addEventListener("load", () => {
      this.dismissLoader();
      this.syncSessionUI();
    });
  }

  // --- MOBILE NAVIGATION TOGGLE ---
  toggleMobileMenu() {
    const navLinks = document.getElementById("navLinks");
    const menuIcon = document.getElementById("menuToggle").querySelector("i");
    navLinks.classList.toggle("open");
    
    if (navLinks.classList.contains("open")) {
      menuIcon.className = "fa-solid fa-xmark";
    } else {
      menuIcon.className = "fa-solid fa-bars";
    }
  }

  // --- SPA ROUTING CONTROL ---
  showPage(pageType) {
    const publicExp = document.getElementById("publicExperience");
    const gmsPanel = document.getElementById("gmsDashboard");
    const navLinks = document.querySelectorAll(".nav-link");

    // Close mobile menu if open
    document.getElementById("navLinks").classList.remove("open");
    document.getElementById("menuToggle").querySelector("i").className = "fa-solid fa-bars";

    if (pageType === "public") {
      publicExp.style.display = "block";
      gmsPanel.style.display = "none";
      window.scrollTo(0, 0);
    } else if (pageType === "gms") {
      publicExp.style.display = "none";
      gmsPanel.style.display = "block";
      window.scrollTo(0, 0);
      
      // Auto redirect if session exists, else open login prompt
      const session = window.GMS.getCurrentSession();
      if (!session) {
        this.openLoginModal();
      } else {
        this.syncSessionUI();
      }
    }

    // Active state in Nav
    navLinks.forEach(link => {
      if (pageType === "gms" && link.textContent.trim() === "GMS Portal") {
        link.classList.add("active");
      } else if (pageType === "public" && link.textContent.trim() !== "GMS Portal") {
        link.classList.remove("active");
      }
    });
  }

  scrollToSection(sectionId) {
    this.showPage("public");
    const el = document.getElementById(sectionId);
    if (el) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = el.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });

      // Update active nav link
      const navLinks = document.querySelectorAll(".nav-link");
      navLinks.forEach(link => {
        if (link.getAttribute("href") === `#${sectionId}`) {
          link.classList.add("active");
        } else {
          link.classList.remove("active");
        }
      });
    }
  }

  // --- CALORIE & BMR CALCULATORS ---
  setGender(gender) {
    this.currentGender = gender;
    document.getElementById("genderMale").classList.toggle("active", gender === "male");
    document.getElementById("genderFemale").classList.toggle("active", gender === "female");
  }

  calculateCalories() {
    const age = parseInt(document.getElementById("calcAge").value);
    const weight = parseFloat(document.getElementById("calcWeight").value);
    const height = parseFloat(document.getElementById("calcHeight").value);
    const goal = document.getElementById("calcGoal").value;
    const activity = parseFloat(document.getElementById("calcActivity").value);

    if (isNaN(age) || isNaN(weight) || isNaN(height)) {
      alert("Please check your height, weight, and age values.");
      return;
    }

    // Mifflin-St Jeor Formula
    let bmr = 0;
    if (this.currentGender === "male") {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }

    const tdee = Math.round(bmr * activity);
    let target = tdee;

    let explanation = "";
    if (goal === "gain") {
      target = tdee + 350;
      explanation = `To gain muscle cleanly, consume ${target} kcal daily (surplus target of 350 kcal). Focus on protein intake (~2g per kg bodyweight).`;
    } else if (goal === "lose") {
      target = tdee - 450;
      explanation = `To optimize fat loss, consume ${target} kcal daily (deficit target of 450 kcal). Make sure to hit weight training targets.`;
    } else {
      explanation = `To maintain physical metrics, consume ${target} kcal daily. Ideal daily macro balance matches normal standard activity.`;
    }

    // Render BMR Panel
    document.getElementById("bmrResult").innerHTML = `${Math.round(bmr)} <span>kcal</span>`;
    document.getElementById("tdeeResult").innerHTML = `${target} <span>kcal/day</span>`;

    // Render descriptive panel
    const resultPanel = document.getElementById("calcResultPanel");
    document.getElementById("calcResultVal").innerText = `${target} kcal`;
    document.getElementById("calcResultDesc").innerText = explanation;
    resultPanel.style.display = "flex";
  }



  // --- MODALS DIALOG CONTROLS ---
  openLoginModal() {
    document.getElementById("loginError").style.display = "none";
    document.getElementById("loginModal").style.display = "flex";
  }

  closeLoginModal() {
    document.getElementById("loginModal").style.display = "none";
  }

  openAddClientModal() {
    document.getElementById("addClientModal").style.display = "flex";
  }

  closeAddClientModal() {
    document.getElementById("addClientModal").style.display = "none";
  }

  openCheckout(planName, price) {
    this.selectedPlanName = planName;
    this.selectedPlanPrice = price;
    
    document.getElementById("checkoutPlanName").innerText = `${planName} Plan`;
    document.getElementById("checkoutPlanPrice").innerText = `₹${price.toLocaleString("en-IN")}`;
    document.getElementById("chkName").value = "";
    document.getElementById("chkEmail").value = "";
    document.getElementById("chkSlot").value = "none";
    document.getElementById("checkoutModal").style.display = "flex";
  }

  closeCheckoutModal() {
    document.getElementById("checkoutModal").style.display = "none";
  }

  // --- SYSTEM AUTHENTICATION ---
  submitLogin() {
    const user = document.getElementById("loginUsername").value.trim();
    const pass = document.getElementById("loginPassword").value.trim();

    const session = window.GMS.login(user, pass);
    if (session) {
      this.closeLoginModal();
      this.showPage("gms");
      this.syncSessionUI();
    } else {
      document.getElementById("loginError").style.display = "block";
    }
  }

  handleLogout() {
    window.GMS.logout();
    this.syncSessionUI();
    this.showPage("public");
  }

  // Sync views with Session statuses
  syncSessionUI() {
    const session = window.GMS.getCurrentSession();
    const loginBtn = document.querySelector(".nav-btn");
    
    const trainerDash = document.getElementById("trainerDashboard");
    const clientPort = document.getElementById("clientPortal");
    const gmsPanel = document.getElementById("gmsDashboard");

    if (session) {
      loginBtn.innerHTML = `<i class="fa-solid fa-right-from-bracket"></i> Logout`;
      loginBtn.onclick = () => this.handleLogout();

      if (session.type === "trainer") {
        trainerDash.style.display = "block";
        clientPort.style.display = "none";
        this.renderTrainerDashboard();
      } else if (session.type === "client") {
        trainerDash.style.display = "none";
        clientPort.style.display = "block";
        this.renderClientPortal(session.user.id);
      }
    } else {
      loginBtn.innerHTML = `<i class="fa-solid fa-user-lock"></i> Login`;
      loginBtn.onclick = () => this.openLoginModal();
      
      trainerDash.style.display = "none";
      clientPort.style.display = "none";
      gmsPanel.style.display = "none";
      
      // If we are currently looking at GMS, switch to public
      if (document.getElementById("gmsDashboard").style.display === "block") {
        this.showPage("public");
      }
    }
  }

  // --- TRAINER CONSOLE ACTIONS ---
  switchTrainerTab(tab) {
    this.activeTrainerTab = tab;
    
    const btnClients = document.getElementById("tabClients");
    const btnSlots = document.getElementById("tabSlots");
    
    const panelClients = document.getElementById("trainerClientsPanel");
    const panelSlots = document.getElementById("trainerSlotsPanel");
    
    const statsRow = document.getElementById("trainerStatsRow");

    if (tab === "clients") {
      btnClients.classList.add("active");
      btnSlots.classList.remove("active");
      
      panelClients.style.display = "grid";
      panelSlots.style.display = "none";
      statsRow.style.display = "grid";
    } else if (tab === "slots") {
      btnClients.classList.remove("active");
      btnSlots.classList.add("active");
      
      panelClients.style.display = "none";
      panelSlots.style.display = "block";
      statsRow.style.display = "none"; // Clean slot focus
      this.renderTrainerSlotsPanel();
    }
  }

  renderTrainerDashboard() {
    const stats = window.GMS.getDashboardStats();
    
    document.getElementById("statActiveClients").innerText = stats.active;
    document.getElementById("statPendingEnrollments").innerText = stats.pending;
    document.getElementById("statTotalRevenue").innerText = `₹${stats.revenue.toLocaleString("en-IN")}`;

    const clients = window.GMS.getClients();
    document.getElementById("clientRegistryCount").innerText = `${clients.length} registered clients`;
    
    const tbody = document.getElementById("clientTableBody");
    tbody.innerHTML = "";

    if (clients.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-dark); padding: 40px;">No clients currently active. Click Add Client to enroll.</td></tr>`;
      return;
    }

    clients.forEach(c => {
      const tr = document.createElement("tr");
      
      // Status badge styling
      let statusBadge = `<span class="status-badge expired">Expired</span>`;
      if (c.status === "active") statusBadge = `<span class="status-badge active">Active</span>`;
      else if (c.status === "pending") statusBadge = `<span class="status-badge pending">Pending</span>`;

      tr.innerHTML = `
        <td>
          <div class="client-identity">
            <div class="client-avatar">${c.name.charAt(0)}</div>
            <div>
              <div class="client-name">${c.name}</div>
              <div class="client-email">${c.email} | ${c.phone}</div>
            </div>
          </div>
        </td>
        <td style="font-weight: 600;">${c.membership} Tier</td>
        <td style="color: var(--primary); font-weight: 600;">${c.plan}</td>
        <td>${statusBadge}</td>
        <td>
          <div class="table-actions">
            <button class="table-btn" title="View & Assign Schedule" onclick="app.selectGmsClient('${c.id}')" style="color: var(--primary);">
              <i class="fa-solid fa-dumbbell"></i>
            </button>
            <button class="table-btn" title="Toggle Active Status" onclick="app.toggleClientStatus('${c.id}')" style="color: #f59e0b;">
              <i class="fa-solid fa-arrows-rotate"></i>
            </button>
            <button class="table-btn delete" title="Delete Client" onclick="app.deleteGmsClient('${c.id}')">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });

    // Load first client schedule on index reset if none selected
    if (clients.length > 0 && !this.selectedGmsClientId) {
      this.selectGmsClient(clients[0].id);
    } else if (this.selectedGmsClientId) {
      this.selectGmsClient(this.selectedGmsClientId);
    }
  }

  selectGmsClient(id) {
    this.selectedGmsClientId = id;
    const client = window.GMS.getClientById(id);
    if (!client) return;

    document.getElementById("selectedClientPlanTitle").innerText = `${client.name} - ${client.plan}`;
    document.getElementById("workoutPlanAssignSelector").value = client.plan;

    const exercises = window.GMS.getWorkoutDetails(client.plan);
    const list = document.getElementById("assignedWorkoutScheduleList");
    list.innerHTML = "";

    exercises.forEach((ex, idx) => {
      const item = document.createElement("div");
      item.className = "workout-split-item";
      item.innerHTML = `
        <div>
          <span style="color: var(--text-dark); margin-right: 8px; font-weight: 700;">Day ${idx + 1}</span>
          <span class="workout-split-name">${ex.name}</span>
        </div>
        <span class="workout-split-tag">${ex.reps}</span>
      `;
      list.appendChild(item);
    });
  }

  handleAssignPlanChange(select) {
    if (!this.selectedGmsClientId) return;
    const planName = select.value;
    
    window.GMS.updateClientWorkout(this.selectedGmsClientId, planName);
    this.renderTrainerDashboard();
    
    const client = window.GMS.getClientById(this.selectedGmsClientId);
    document.getElementById("selectedClientPlanTitle").innerText = `${client.name} - ${client.plan}`;
  }

  toggleClientStatus(id) {
    const client = window.GMS.getClientById(id);
    if (!client) return;

    let nextStatus = "active";
    if (client.status === "active") nextStatus = "pending";
    else if (client.status === "pending") nextStatus = "expired";
    
    window.GMS.updateClientStatus(id, nextStatus);
    this.renderTrainerDashboard();
  }

  deleteGmsClient(id) {
    if (confirm("Are you sure you want to permanently delete this client record?")) {
      window.GMS.deleteClient(id);
      if (this.selectedGmsClientId === id) this.selectedGmsClientId = null;
      this.renderTrainerDashboard();
    }
  }

  // Render Slots Panel in GMS
  renderTrainerSlotsPanel() {
    const slots = window.GMS.getSlots();
    const container = document.getElementById("trainerSlotsGrid");
    if (!container) return;

    container.innerHTML = "";
    
    // Get list of clients for drop selection
    const clients = window.GMS.getClients().filter(c => c.status === "active");

    slots.forEach(s => {
      const card = document.createElement("div");
      card.className = "gms-slot-card glass-panel";
      
      let clientOptionList = `<option value="none">Assign Client...</option>`;
      clients.forEach(c => {
        const isCurrent = c.id === s.bookedBy;
        clientOptionList += `<option value="${c.id}" ${isCurrent ? 'selected' : ''}>${c.name}</option>`;
      });

      if (s.bookedBy) {
        card.style.borderColor = "rgba(244, 63, 94, 0.2)";
        card.innerHTML = `
          <div class="gms-slot-header">
            <span class="gms-slot-time"><i class="fa-solid fa-clock" style="color: var(--primary);"></i> ${s.time}</span>
            <span class="status-badge active" style="font-size: 0.65rem;">LOCKED</span>
          </div>
          <div>
            <div class="gms-slot-client">Active Roster Client:</div>
            <div style="font-weight: 700; margin-top: 2px;">${s.clientName}</div>
          </div>
          <div style="display: flex; gap: 8px;">
            <select class="workout-select" style="flex: 1;" onchange="app.handleGmsSlotSelectChange('${s.id}', this)">
              ${clientOptionList}
            </select>
            <button class="gms-slot-btn free" onclick="app.handleGmsFreeSlot('${s.id}')">Free Slot</button>
          </div>
        `;
      } else {
        card.style.borderColor = "rgba(16, 185, 129, 0.2)";
        card.innerHTML = `
          <div class="gms-slot-header">
            <span class="gms-slot-time"><i class="fa-regular fa-clock" style="color: var(--secondary);"></i> ${s.time}</span>
            <span class="status-badge pending" style="font-size: 0.65rem; color: var(--secondary); background: rgba(16, 185, 129, 0.1); border-color: rgba(16, 185, 129, 0.2);">FREE</span>
          </div>
          <div style="color: var(--text-dark); font-size: 0.85rem; font-style: italic;">No workout allocated.</div>
          <select class="workout-select" style="width: 100%;" onchange="app.handleGmsSlotSelectChange('${s.id}', this)">
            ${clientOptionList}
          </select>
        `;
      }
      container.appendChild(card);
    });
  }

  handleGmsSlotSelectChange(slotId, select) {
    const clientId = select.value;
    if (clientId === "none") {
      this.handleGmsFreeSlot(slotId);
      return;
    }

    window.GMS.assignClientSlot(slotId, clientId);
    this.renderTrainerSlotsPanel();
  }

  handleGmsFreeSlot(slotId) {
    window.GMS.freeClientSlot(slotId);
    this.renderTrainerSlotsPanel();
  }

  submitAddClient() {
    const name = document.getElementById("addClientName").value.trim();
    const email = document.getElementById("addClientEmail").value.trim();
    const phone = document.getElementById("addClientPhone").value.trim();
    const goal = document.getElementById("addClientGoal").value.trim();
    const membership = document.getElementById("addClientMembership").value;
    const plan = document.getElementById("addClientPlan").value;
    const weight = document.getElementById("addClientWeight").value;
    const height = document.getElementById("addClientHeight").value;
    const dailyIntake = document.getElementById("addClientCalories").value;
    const slotId = document.getElementById("addClientSlot").value;

    if (!name || !email) {
      alert("Name and Email are required properties.");
      return;
    }

    const newClient = window.GMS.addClient({
      name, email, phone, goal, membership, plan, weight, height, dailyIntake
    });

    // If a time slot was chosen, book it immediately
    if (slotId !== "none") {
      window.GMS.assignClientSlot(slotId, newClient.id);
    }

    this.closeAddClientModal();
    this.renderTrainerDashboard();
    this.renderTrainerSlotsPanel();
  }

  // --- CLIENT PORTAL & DAILY LOGS ---
  renderClientPortal(id) {
    const client = window.GMS.getClientById(id);
    if (!client) return;

    // Header details
    document.getElementById("clientPortalHeaderName").innerText = client.name;
    document.getElementById("clientPortalInitials").innerText = client.name.split(' ').map(n => n[0]).join('');
    document.getElementById("clientPortalName").innerText = client.name;
    document.getElementById("clientPortalMembership").innerText = `${client.membership} Tier Membership`;

    // Stats Grid
    document.getElementById("clientPortalPlan").innerText = client.plan;
    document.getElementById("clientPortalWeight").innerText = `${client.weight} kg`;
    document.getElementById("clientPortalCalories").innerText = `${client.dailyIntake} kcal`;

    // Fetch assigned Time Slot
    const slot = window.GMS.getClientSlot(client.id);
    const slotVal = slot ? slot.time.split(' - ')[0] : "No slot allocated";
    document.getElementById("clientPortalTimeSlot").innerText = slotVal;

    // Active Workout split details
    const exercises = window.GMS.getWorkoutDetails(client.plan);
    const todayWorkout = exercises[0];
    document.getElementById("clientPortalRoutineName").innerText = `${todayWorkout.name} (${todayWorkout.reps})`;

    // Log item check state bindings
    this.updatePortalCheckState("workout", client.dailyLog.workout);
    this.updatePortalCheckState("cardio", client.dailyLog.cardio);
    this.updatePortalCheckState("meals", client.dailyLog.meals);
    this.updatePortalCheckState("water", client.dailyLog.water);

    this.updatePortalTotalProgress(client.dailyLog);
  }

  togglePortalLog(key) {
    const session = window.GMS.getCurrentSession();
    if (!session || session.type !== "client") return;
    
    const client = window.GMS.getClientById(session.user.id);
    if (!client) return;

    const currentVal = client.dailyLog[key];
    const updatedLogs = window.GMS.updateDailyLog(client.id, key, !currentVal);
    
    if (updatedLogs) {
      this.updatePortalCheckState(key, !currentVal);
      this.updatePortalTotalProgress(updatedLogs);
    }
  }

  updatePortalCheckState(key, checked) {
    const idSuffix = key.charAt(0).toUpperCase() + key.slice(1);
    const item = document.getElementById(`logItem${idSuffix}`);
    const checkIcon = document.getElementById(`logChk${idSuffix}`).querySelector("i");
    
    if (checked) {
      item.classList.add("checked");
      checkIcon.style.display = "block";
    } else {
      item.classList.remove("checked");
      checkIcon.style.display = "none";
    }
  }

  updatePortalTotalProgress(log) {
    let completedCount = 0;
    const total = 4;
    
    if (log.workout) completedCount++;
    if (log.cardio) completedCount++;
    if (log.meals) completedCount++;
    if (log.water) completedCount++;

    const progressPercent = Math.round((completedCount / total) * 100);
    const progressBadge = document.getElementById("clientPortalGoalStatus");
    
    if (progressPercent === 100) {
      progressBadge.innerText = "100% Targets Met!";
      progressBadge.style.color = "var(--secondary)";
      progressBadge.style.borderColor = "rgba(16, 185, 129, 0.4)";
      progressBadge.style.background = "rgba(16, 185, 129, 0.15)";
    } else {
      progressBadge.innerText = `${progressPercent}% Today's Target`;
      progressBadge.style.color = "var(--primary)";
      progressBadge.style.borderColor = "rgba(244, 63, 94, 0.3)";
      progressBadge.style.background = "rgba(244, 63, 94, 0.1)";
    }
  }

  // --- DYNAMIC CHECKOUT TRANSACTION SIMULATION ---
  submitCheckoutPayment() {
    const name = document.getElementById("chkName").value.trim();
    const email = document.getElementById("chkEmail").value.trim();
    const slotId = document.getElementById("chkSlot").value;

    if (!name || !email) {
      alert("Name and email are required for membership billing.");
      return;
    }

    let initialCalorieTarget = 2400;
    if (this.selectedPlanName === "Platinum") initialCalorieTarget = 2800;
    else if (this.selectedPlanName === "Gold") initialCalorieTarget = 2600;

    let assignedPlan = "3-Day Split";
    if (this.selectedPlanName === "Platinum") assignedPlan = "5-Day Split";
    else if (this.selectedPlanName === "Gold") assignedPlan = "Push-Pull-Legs";

    // Register inside our GMS Local Directory
    const newClient = window.GMS.addClient({
      name,
      email,
      phone: "+91 " + Math.floor(6000000000 + Math.random() * 3999999999),
      goal: this.selectedPlanName === "Platinum" ? "Muscle Gain" : "General Fitness",
      plan: assignedPlan,
      membership: this.selectedPlanName,
      weight: 75,
      height: 175,
      dailyIntake: initialCalorieTarget
    });

    // Handle Slot Booking Allocation
    if (slotId !== "none") {
      window.GMS.assignClientSlot(slotId, newClient.id);
    }

    this.closeCheckoutModal();
    alert(`Success! Payment Received for ${name}.\nYour client credentials: \n• Email/Username: ${email}\n• Password: client123\n\nLogin inside GMS Portal to track targets.`);
    
    this.showPage("gms");
    this.openLoginModal();
    document.getElementById("loginUsername").value = email;
    document.getElementById("loginPassword").value = "client123";
  }

  submitConsultation() {
    const name = document.getElementById("contactName").value.trim();
    const phone = document.getElementById("contactPhone").value.trim();
    const email = document.getElementById("contactEmail").value.trim();
    const slotId = document.getElementById("contactSlot").value;
    const msg = document.getElementById("contactMessage").value.trim();

    if (!name || !email) {
      alert("Name and Email details are required.");
      return;
    }

    let slotText = "";
    if (slotId !== "none") {
      const slotName = document.querySelector(`#contactSlot option[value="${slotId}"]`).text;
      slotText = ` for the preferred slot hour [${slotName}]`;
    }

    alert(`Thank you, ${name}! Your consultation request${slotText} has been received. Trainer Khemu will contact you within 24 hours at ${email}.`);
    
    // Clear inputs
    document.getElementById("contactName").value = "";
    document.getElementById("contactPhone").value = "";
    document.getElementById("contactEmail").value = "";
    document.getElementById("contactSlot").value = "none";
    document.getElementById("contactMessage").value = "";
  }
}

const app = new AppController();
window.app = app;
