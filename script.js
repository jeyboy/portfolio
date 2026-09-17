"use strict";

// All pages, navigation, case-study text and CV downloads work without JS.
// This enhancement is a local architecture illustration, not a live AI demo.
(() => {
  function init(root = document) {
    const retryToggle = root.querySelector("#retry-toggle");
    const retryBranch = root.querySelector("#retry-branch");
    const branchStatus = root.querySelector("#branch-status");
    const retryNote = root.querySelector("#retry-note");
    const flowOutput = root.querySelector("#flow-output");
    if (retryToggle && retryBranch && branchStatus && retryNote && flowOutput) {
      retryToggle.hidden = false;
      if (!retryToggle.dataset.initialized) {
        retryToggle.dataset.initialized = "true";
        retryToggle.addEventListener("click", () => {
          const showRetry = retryToggle.getAttribute("aria-pressed") !== "true";
          retryToggle.setAttribute("aria-pressed", String(showRetry));
          retryBranch.classList.toggle("is-retrying", showRetry);
          branchStatus.textContent = showRetry ? "Needs retry" : "Complete";
          retryNote.hidden = !showRetry;
          flowOutput.textContent = showRetry ? "Awaiting retry" : "{ JSON }";
          retryToggle.textContent = showRetry ? "Show completed path ↗" : "Show retry path ↗";
        });
      }
    }
    const year = root.querySelector("#year");
    if (year) year.textContent = String(new Date().getFullYear());
  }
  window.Portfolio = Object.freeze({ init });
  init();
})();
