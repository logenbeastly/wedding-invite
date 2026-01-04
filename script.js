(function () {
  const params = new URLSearchParams(window.location.search);

  const guestName = (params.get("name") || "").trim();
  const safeName = guestName.length ? guestName : "Dear Guest";

  const guestNameEl = document.getElementById("guestName");
  const guestNameField = document.getElementById("guestNameField");
  const responseField = document.getElementById("responseField");

  const yesBtn = document.getElementById("yesBtn");
  const noBtn = document.getElementById("noBtn");
  const paxRow = document.getElementById("paxRow");
  const paxSel = document.getElementById("pax");
  const submitBtn = document.getElementById("submitBtn");
  const hint = document.getElementById("hint");
  const status = document.getElementById("status");
  const form = document.getElementById("rsvpForm");

  guestNameEl.textContent = safeName;
  guestNameField.value = safeName;

  function setSelected(which) {
    status.textContent = "";
    yesBtn.classList.toggle("selected", which === "YES");
    noBtn.classList.toggle("selected", which === "NO");

    responseField.value = which;

    if (which === "YES") {
      paxRow.classList.add("show");
      paxRow.setAttribute("aria-hidden", "false");
      paxSel.disabled = false;

      // Require pax before enabling submit
      submitBtn.disabled = (paxSel.value === "");
      hint.textContent = submitBtn.disabled ? "Select pax to continue." : "Ready to submit.";
    } else {
      paxRow.classList.remove("show");
      paxRow.setAttribute("aria-hidden", "true");
      paxSel.disabled = true;
      paxSel.value = "";

      submitBtn.disabled = false;
      hint.textContent = "Ready to submit.";
    }
  }

  yesBtn.addEventListener("click", () => setSelected("YES"));
  noBtn.addEventListener("click", () => setSelected("NO"));

  paxSel.addEventListener("change", () => {
    if (responseField.value === "YES") {
      submitBtn.disabled = (paxSel.value === "");
      hint.textContent = submitBtn.disabled ? "Select pax to continue." : "Ready to submit.";
    }
  });

  // AJAX submit so the page doesn't navigate away
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!responseField.value) {
      status.textContent = "Please choose Yes or No.";
      return;
    }
    if (responseField.value === "YES" && !paxSel.value) {
      status.textContent = "Please select number of pax.";
      return;
    }

    submitBtn.disabled = true;
    status.textContent = "Submitting…";

    try {
      const formData = new FormData(form);
      const res = await fetch("/", { method: "POST", body: formData });

      if (res.ok) {
        status.textContent = "Thank you! RSVP received 🥂";
        hint.textContent = "You can close this page now.";
        yesBtn.disabled = true;
        noBtn.disabled = true;
        paxSel.disabled = true;
        form.querySelector("#message").disabled = true;
      } else {
        status.textContent = "Something went wrong. Please try again.";
        submitBtn.disabled = false;
      }
    } catch (err) {
      status.textContent = "Network error. Please try again.";
      submitBtn.disabled = false;
    }
  });
})();
