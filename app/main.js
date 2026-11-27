// DealRadar bootstrap: reads the filter state from the URL, renders the list
// or a deal detail page, and keeps the address bar in sync so a filtered view
// (or a single deal) can be shared and screenshotted.

import { deals, CATEGORIES, STORES, CHECKED_LABEL } from "./deals.js";
import { filterDeals, sortDeals, statsFor } from "./filters.js";
import { cardHtml, detailHtml, statsHtml } from "./render.js";

const app = document.getElementById("app");
const grid = document.getElementById("grid");
const countEl = document.getElementById("count");
const searchEl = document.getElementById("search");
const categoryEl = document.getElementById("categories");
const storeEl = document.getElementById("store");
const discountEl = document.getElementById("discount");
const sortEl = document.getElementById("sort");
const verdictEl = document.getElementById("verdict");
const statsEl = document.getElementById("stats");
const checkedEl = document.getElementById("checked-line");

function readState() {
  const params = new URLSearchParams(location.search);
  return {
    query: params.get("q") || "",
    category: params.get("cat") || "All",
    store: params.get("store") || "All",
    minDiscount: Number(params.get("min") || 0),
    sort: params.get("sort") || "best",
    verdict: params.get("verdict") || "all",
  };
}

function writeState(state, replace) {
  const params = new URLSearchParams();
  if (state.query) params.set("q", state.query);
  if (state.category !== "All") params.set("cat", state.category);
  if (state.store !== "All") params.set("store", state.store);
  if (state.minDiscount) params.set("min", String(state.minDiscount));
  if (state.sort !== "best") params.set("sort", state.sort);
  if (state.verdict !== "all") params.set("verdict", state.verdict);
  const qs = params.toString();
  const url = qs ? `?${qs}${location.hash}` : location.pathname + location.hash;
  if (replace) history.replaceState(null, "", url);
  else history.pushState(null, "", url);
}

function fillControls(state) {
  searchEl.value = state.query;
  categoryEl.innerHTML = CATEGORIES.map(
    (c) => `<button type="button" data-cat="${c}" class="${c === state.category ? "active" : ""}">${c}</button>`,
  ).join("");
  storeEl.innerHTML = STORES.map(
    (s) => `<option value="${s}" ${s === state.store ? "selected" : ""}>${s === "All" ? "All stores" : s}</option>`,
  ).join("");
  discountEl.value = String(state.minDiscount);
  sortEl.value = state.sort;
  verdictEl.value = state.verdict;
}

function renderList(state) {
  const filtered = sortDeals(filterDeals(deals, state), state.sort);
  grid.innerHTML = filtered.length
    ? filtered.map(cardHtml).join("")
    : `<p class="empty">No deals match those filters. <a href="#/" id="clear-filters">Clear the filters</a> to see all ${deals.length} deals.</p>`;
  countEl.textContent = filtered.length === deals.length
    ? `Showing all ${deals.length} deals`
    : `Showing ${filtered.length} of ${deals.length} deals`;
  const clear = document.getElementById("clear-filters");
  if (clear) clear.addEventListener("click", () => applyState({ ...state, query: "", category: "All", store: "All", minDiscount: 0, verdict: "all" }));
}

function applyState(state, replace = true) {
  fillControls(state);
  renderList(state);
  writeState(state, replace);
}

function route() {
  const hash = location.hash || "#/";
  const detail = hash.match(/^#\/deal\/([\w-]+)$/);
  const state = readState();
  statsEl.innerHTML = statsHtml(statsFor(deals));
  checkedEl.textContent = `All prices checked ${CHECKED_LABEL} from the named store or source.`;
  if (detail) {
    document.body.classList.add("detail-view");
    const deal = deals.find((d) => d.id === detail[1]);
    grid.innerHTML = deal ? detailHtml(deal) : `<p class="empty">That deal is not in this finder. <a href="#/">Back to all deals</a>.</p>`;
    countEl.textContent = deal ? `${deal.store} · ${deal.category}` : "";
    fillControls(state);
  } else {
    document.body.classList.remove("detail-view");
    applyState(state);
  }
  window.scrollTo(0, 0);
}

let typingTimer = null;
searchEl.addEventListener("input", () => {
  clearTimeout(typingTimer);
  typingTimer = setTimeout(() => {
    const state = readState();
    state.query = searchEl.value;
    applyState(state, false);
  }, 200);
});
categoryEl.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-cat]");
  if (!btn) return;
  const state = readState();
  state.category = btn.dataset.cat;
  applyState(state, false);
});
storeEl.addEventListener("change", () => {
  const state = readState();
  state.store = storeEl.value;
  applyState(state, false);
});
discountEl.addEventListener("change", () => {
  const state = readState();
  state.minDiscount = Number(discountEl.value);
  applyState(state, false);
});
sortEl.addEventListener("change", () => {
  const state = readState();
  state.sort = sortEl.value;
  applyState(state, false);
});
verdictEl.addEventListener("change", () => {
  const state = readState();
  state.verdict = verdictEl.value;
  applyState(state, false);
});

window.addEventListener("hashchange", route);
window.addEventListener("popstate", route);
route();
