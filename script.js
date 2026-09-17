"use strict";
// Content, links and CV downloads are ordinary HTML. Motion is an enhancement.
(() => {
  function init(root = document) {
    const year = root.querySelector('#year');
    if (year) year.textContent = String(new Date().getFullYear());
    window.PortfolioCat?.init(root);
    window.PortfolioMotion?.init(root);
  }
  window.Portfolio = Object.freeze({ init });
  init();
})();
