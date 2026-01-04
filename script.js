(function () {
  /* ========= CONFIG (optional) =========
     Leave as-is if you prefer editing names in HTML.
     If you change here, it will overwrite #coupleA/#coupleB text.
  */
  const coupleA = "Novin";
  const coupleB = "Hui Ting";

  /* ========= HELPERS ========= */
  const $ = (id) => document.getElementById(id);
  const setText = (id, value) => {
    const el = $(id);
    if (el) el.textContent = value;
  };

  /* ========= URL PARAMS ========= */
  const params = new URLSearchParams(window.location.search);
  const guestName = (params.get("name") || "").trim();
  const safeName = guestName || "Dear Guest";

  /* ========= ELEMENTS (match your HTML) ========= */
  const guestNameEl = $("guestName");
  const guestNameField = $("guestNameField");
  const responseField = $("responseField");
  const paxField = $("paxField");

  const yesBtn = $("yesBtn");
  const noBtn = $("noBtn");
  const paxRow = $("paxRow");
  const submitBtn = $("submitBtn");
  const hint = $("hint");
  const status = $("status");
  const form = $("rsvpForm");
  const messageEl = $("message");

  const paxChips = document.querySelectorAll(".chip");

  /* ========= INIT ========= */
  if (guestNameEl) guestNameEl.textContent = safeName;
  if (guestNameField) guestNameField.value = safeName;

  // Only set couple names if those elements exist (they do in your HTML)
  setText("coupleA", coupleA);
  setText("coupleB", coupleB);

  /* ========= REQUIRED ELEMENTS CHECK ========= */
  const required = [
    ["rsvpForm", form],
    ["yesBtn", yesBtn],
    ["noBtn", noBtn],
    ["submitBtn", submitBtn],
    ["responseField", responseField],
    ["paxField", paxField],
    ["guestNameField", guestNameField],
  ];

  const missing = required.filter(([_, el]) => !el).map(([name]) => name);
  if (missing.length) {
    console.error("Missing required elements:", missing.join(", "));
    if (status) status.textContent = "Page error: missing form elements.";
    return;
  }

  /* ========= RSVP STATE ========= */
  function clearPax() {
    paxField.value = "";
    paxChips.forEach((c) => c.classList.remove("selected"));
  }

  function setHint(text) {
    if (hint) hint.textContent = text;
  }

  function setResponse(val) {
    if (status) status.textContent = "";
    responseField.value = val;

    yesBtn.classList.toggle("selected", val === "YES");
    noBtn.classList.toggle("selected", val === "NO");

    if (val === "YES") {
      if (paxRow) paxRow.classList.add("show");
      submitBtn.disabled = !paxField.value;
      setHint(submitBtn.disabled ? "Select number of pax." : "Ready to submit.");
    } else {
      if (paxRow) paxRow.classList.remove("show");
      clearPax();
      submitBtn.disabled = false;
      setHint("Ready to submit.");
    }
  }

  /* ========= BIND BUTTONS ========= */
  yesBtn.addEventListener("click", () => setResponse("YES"));
  noBtn.addEventListener("click", () => setResponse("NO"));

  paxChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      // Only allow pax selection if YES is selected
      if (responseField.value !== "YES") {
        setResponse("YES");
      }
      paxChips.forEach((c) => c.classList.remove("selected"));
      chip.classList.add("selected");
      paxField.value = chip.dataset.pax || "";
      submitBtn.disabled = false;
      setHint("Ready to submit.");
    });
  });

  // Initial UI state
  submitBtn.disabled = true;
  setHint("Choose Yes or No first.");

  /* ========= SUBMIT (Netlify x-www-form-urlencoded) ========= */
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!responseField.value) {
      if (status) status.textContent = "Please choose Yes or No.";
      return;
    }
    if (responseField.value === "YES" && !paxField.value) {
      if (status) status.textContent = "Please select number of pax.";
      return;
    }

    submitBtn.disabled = true;
    if (status) status.textContent = "Submitting…";

    try {
      const body = new URLSearchParams(new FormData(form)).toString();

      const res = await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body
      });

      if (res.ok) {
        if (status) status.textContent = "Thank you! RSVP received 🥂";
        setHint("You may close this page.");

        yesBtn.disabled = true;
        noBtn.disabled = true;
        paxChips.forEach((c) => (c.disabled = true));
        if (messageEl) messageEl.disabled = true;
      } else {
        if (status) status.textContent = `Submission failed (HTTP ${res.status}).`;
        submitBtn.disabled = false;
      }
    } catch (err) {
      if (status) status.textContent = "Network error. Please try again.";
      submitBtn.disabled = false;
    }
  });
})();
