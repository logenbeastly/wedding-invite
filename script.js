(function () {

  /* ========= CONFIG ========= */
  const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzLxkehFz79asOtvTecgQYWrnwn6t8gU9I7T3QniU1GqmV1RJ216x8fH_rwm19-pPZyMw/exec"; // must end with /exec

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
    paxChips.forEach(c => c.classList.remove("selected"));
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

  paxChips.forEach(chip => {
    chip.addEventListener("click", () => {
      if (responseField.value !== "YES") setResponse("YES");
      paxChips.forEach(c => c.classList.remove("selected"));
      chip.classList.add("selected");
      paxField.value = chip.dataset.pax || "";
      submitBtn.disabled = false;
      setHint("Ready to submit.");
    });
  });

  submitBtn.disabled = true;
  setHint("Choose Yes or No first.");

  /* ========= SUBMIT (CORS-safe: x-www-form-urlencoded) ========= */
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

    const payload = new URLSearchParams();
    payload.set("guest_name", guestNameField.value || "");
    payload.set("response", responseField.value || "");
    payload.set("pax", paxField.value || "");
    payload.set("message", (messageEl && messageEl.value) ? messageEl.value : "");

    try {
      const res = await fetch(SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
        body: payload.toString(),
        redirect: "follow"
      });

      // Apps Script can return plain text; handle both JSON and text
      const text = await res.text();
      let json = null;
      try { json = JSON.parse(text); } catch {}

      if (res.ok && (json?.success === true || text.trim() === "OK" || text.trim() === "")) {
        status.textContent = "Thank you! RSVP received 🥂";
        setHint("You may close this page.");

        yesBtn.disabled = true;
        noBtn.disabled = true;
        paxChips.forEach(c => c.disabled = true);
        if (messageEl) messageEl.disabled = true;
      } else {
        status.textContent = "Submission failed. " + (json?.error ? json.error : "");
        submitBtn.disabled = false;
      }
    } catch (err) {
      console.error(err);
      status.textContent = "Network/CORS error. Please try again.";
      submitBtn.disabled = false;
    }
  });

})();
