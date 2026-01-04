(function () {

  /* ========= CONFIG ========= */
  const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzLxkehFz79asOtvTecgQYWrnwn6t8gU9I7T3QniU1GqmV1RJ216x8fH_rwm19-pPZyMw/exec";
  // MUST end with /exec

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
      paxField.value = chip.dataset.pax;

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

    const payload = {
      guest_name: guestNameField.value,
      response: responseField.value,
      pax: paxField.value,
      message: messageEl.value
    };

    try {
      const res = await fetch(SCRIPT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload),
        redirect: "follow"
      });

      const text = await res.text();

      let json;
      try {
        json = JSON.parse(text);
      } catch {
        throw new Error(
          "Server did not return JSON. Response was:\n" +
          text.slice(0, 150)
        );
      }

      if (json.success) {
        status.textContent = "Thank you! RSVP received 🥂";
        setHint("You may close this page.");

        yesBtn.disabled = true;
        noBtn.disabled = true;
        paxChips.forEach(c => c.disabled = true);
        messageEl.disabled = true;
      } else {
        status.textContent = "Submission failed: " + (json.error || "Unknown error");
        submitBtn.disabled = false;
      }

    } catch (err) {
      console.error(err);
      status.textContent =
        "Unable to submit RSVP. Please check connection or try again later.";
      submitBtn.disabled = false;
    }
  });

})();
