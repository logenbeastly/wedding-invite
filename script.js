(function () {
  /* ========= CONFIG ========= */
  const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzLxkehFz79asOtvTecgQYWrnwn6t8gU9I7T3QniU1GqmV1RJ216x8fH_rwm19-pPZyMw/exec";

  /* ========= HELPERS ========= */
  const $ = (id) => document.getElementById(id);

  /* ========= URL PARAM ========= */
  const params = new URLSearchParams(window.location.search);
  const guestName = (params.get("name") || "").trim();
  const safeName = guestName || "Dear Guest";

  /* ========= ELEMENTS ========= */
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

  function clearPax() {
    paxField.value = "";
    paxChips.forEach((c) => c.classList.remove("selected"));
  }

  function setHint(text) {
    if (hint) hint.textContent = text;
  }

  function setResponse(val) {
    responseField.value = val;
    yesBtn.classList.toggle("selected", val === "YES");
    noBtn.classList.toggle("selected", val === "NO");

    if (val === "YES") {
      paxRow.classList.add("show");
      submitBtn.disabled = !paxField.value;
      setHint(submitBtn.disabled ? "Select number of pax." : "Ready to submit.");
    } else {
      paxRow.classList.remove("show");
      clearPax();
      submitBtn.disabled = false;
      setHint("Ready to submit.");
    }
  }

  yesBtn.addEventListener("click", () => setResponse("YES"));
  noBtn.addEventListener("click", () => setResponse("NO"));

  paxChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      if (responseField.value !== "YES") setResponse("YES");
      paxChips.forEach((c) => c.classList.remove("selected"));
      chip.classList.add("selected");
      paxField.value = chip.dataset.pax || "";
      submitBtn.disabled = false;
      setHint("Ready to submit.");
    });
  });

  submitBtn.disabled = true;
  setHint("Choose Yes or No first.");

  /* ========= SUBMIT ========= */
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    status.textContent = "";

    if (!responseField.value) {
      status.textContent = "Please choose Yes or No.";
      return;
    }
    if (responseField.value === "YES" && !paxField.value) {
      status.textContent = "Please select number of pax.";
      return;
    }

    submitBtn.disabled = true;
    status.textContent = "Submitting…";

    // Build x-www-form-urlencoded body WITHOUT setting headers (avoids preflight)
    const payload = new URLSearchParams();
    payload.set("guest_name", guestNameField.value || "");
    payload.set("response", responseField.value || "");
    payload.set("pax", paxField.value || "");
    payload.set("message", (messageEl && messageEl.value) ? messageEl.value : "");

    const bodyStr = payload.toString();

    // 1) Best: sendBeacon (no CORS readback, but very reliable)
    let sent = false;
    try {
      if (navigator.sendBeacon) {
        const blob = new Blob([bodyStr], { type: "application/x-www-form-urlencoded" });
        sent = navigator.sendBeacon(SCRIPT_URL, blob);
      }
    } catch (_) {
      sent = false;
    }

    // 2) Fallback: fetch with no-cors (also no readback)
    if (!sent) {
      try {
        await fetch(SCRIPT_URL, {
          method: "POST",
          mode: "no-cors",
          body: payload
        });
        sent = true;
      } catch (_) {
        sent = false;
      }
    }

    if (sent) {
      status.textContent = "Thank you! RSVP received 🥂";
      setHint("You may close this page.");

      yesBtn.disabled = true;
      noBtn.disabled = true;
      paxChips.forEach((c) => (c.disabled = true));
      if (messageEl) messageEl.disabled = true;
    } else {
      status.textContent = "Unable to submit. Please try again.";
      submitBtn.disabled = false;
    }
  });
})();
