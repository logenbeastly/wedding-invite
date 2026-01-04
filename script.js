(function () {

  /* ========= CONFIG ========= */
  const coupleA = "Logen";
  const coupleB = "Partner";

  /* ========= URL PARAMS ========= */
  const params = new URLSearchParams(window.location.search);
  const guestName = (params.get("name") || "").trim();
  const safeName = guestName || "Dear Guest";

  /* ========= ELEMENTS ========= */
  const guestNameEl = document.getElementById("guestName");
  const guestNameField = document.getElementById("guestNameField");
  const responseField = document.getElementById("responseField");
  const paxField = document.getElementById("paxField");

  const yesBtn = document.getElementById("yesBtn");
  const noBtn = document.getElementById("noBtn");
  const paxRow = document.getElementById("paxRow");
  const paxChips = document.querySelectorAll(".chip");

  const submitBtn = document.getElementById("submitBtn");
  const hint = document.getElementById("hint");
  const status = document.getElementById("status");
  const form = document.getElementById("rsvpForm");
  const messageEl = document.getElementById("message");

  /* ========= INIT ========= */
  guestNameEl.textContent = safeName;
  guestNameField.value = safeName;

  document.getElementById("coupleA").textContent = coupleA;
  document.getElementById("coupleB").textContent = coupleB;
  document.getElementById("nameA").textContent = coupleA;
  document.getElementById("nameB").textContent = coupleB;

  function clearPax() {
    paxField.value = "";
    paxChips.forEach(c => c.classList.remove("selected"));
  }

  function setResponse(val) {
    responseField.value = val;
    yesBtn.classList.toggle("selected", val === "YES");
    noBtn.classList.toggle("selected", val === "NO");

    if (val === "YES") {
      paxRow.classList.add("show");
      submitBtn.disabled = !paxField.value;
      hint.textContent = submitBtn.disabled
        ? "Select number of pax."
        : "Ready to submit.";
    } else {
      paxRow.classList.remove("show");
      clearPax();
      submitBtn.disabled = false;
      hint.textContent = "Ready to submit.";
    }
  }

  yesBtn.onclick = () => setResponse("YES");
  noBtn.onclick = () => setResponse("NO");

  paxChips.forEach(chip => {
    chip.onclick = () => {
      paxChips.forEach(c => c.classList.remove("selected"));
      chip.classList.add("selected");
      paxField.value = chip.dataset.pax;
      submitBtn.disabled = false;
      hint.textContent = "Ready to submit.";
    };
  });

  /* ========= SUBMIT ========= */
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

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

    try {
      const body = new URLSearchParams(new FormData(form)).toString();

      const res = await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body
      });

      if (res.ok) {
        status.textContent = "Thank you! RSVP received 🥂";
        hint.textContent = "You may close this page.";

        yesBtn.disabled = true;
        noBtn.disabled = true;
        paxChips.forEach(c => c.disabled = true);
        if (messageEl) messageEl.disabled = true;
      } else {
        status.textContent = `Submission failed (HTTP ${res.status}).`;
        submitBtn.disabled = false;
      }
    } catch {
      status.textContent = "Network error. Please try again.";
      submitBtn.disabled = false;
    }
  });

})();
