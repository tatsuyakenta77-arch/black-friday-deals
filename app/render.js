// DealRadar rendering: deal cards, the detail page and the stats bar.
// Builds DOM with plain strings + textContent-safe escaping for titles.

import { discountOf, savingOf, verdictLabel } from "./filters.js";

export function money(n) {
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace(/\.00$/, "");
}

export function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function checkedLabel(iso) {
  const d = new Date(iso);
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "UTC",
    timeZoneName: "short",
  });
}

export function cardHtml(deal) {
  const pct = discountOf(deal);
  const saved = savingOf(deal);
  return `
  <article class="card" data-id="${deal.id}">
    <div class="card-top">
      <span class="badge badge-${deal.verdict}">${verdictLabel(deal.verdict)}</span>
      <span class="pct">−${pct}%</span>
    </div>
    <h3 class="card-title"><a href="#/deal/${deal.id}">${escapeHtml(deal.title)}</a></h3>
    <p class="card-meta">${escapeHtml(deal.store)} · ${escapeHtml(deal.category)}</p>
    <p class="card-price"><span class="now">${money(deal.price)}</span>
      <span class="was">${money(deal.was)}</span>
      <span class="save">save ${money(saved)}</span></p>
    <p class="card-checked">Checked ${checkedLabel(deal.checked)} · ${escapeHtml(deal.source)}</p>
    <div class="card-actions">
      <a class="btn btn-store" href="${escapeHtml(deal.url)}" target="_blank" rel="noopener">View at ${escapeHtml(deal.store)} ↗</a>
      <a class="btn btn-ghost" href="#/deal/${deal.id}">Why it's real</a>
    </div>
  </article>`;
}

export function detailHtml(deal) {
  const pct = discountOf(deal);
  const saved = savingOf(deal);
  return `
  <div class="detail">
    <p class="crumbs"><a href="#/">← All deals</a> · ${escapeHtml(deal.category)} · ${escapeHtml(deal.store)}</p>
    <span class="badge badge-${deal.verdict} badge-big">${verdictLabel(deal.verdict)}</span>
    <h2>${escapeHtml(deal.title)}</h2>
    <div class="detail-grid">
      <div class="price-box">
        <p class="detail-now">${money(deal.price)}</p>
        <p class="detail-was">Usual price <s>${money(deal.was)}</s> · <strong>−${pct}% · save ${money(saved)}</strong></p>
        <a class="btn btn-store btn-big" href="${escapeHtml(deal.url)}" target="_blank" rel="noopener">Buy at ${escapeHtml(deal.store)} ↗</a>
        <p class="fine">Link opens the store's own search for this product. Prices move during Black Friday — confirm at checkout.</p>
      </div>
      <div class="evidence-box">
        <h3>Why this is a real deal</h3>
        <p>${escapeHtml(deal.note)}</p>
        <dl>
          <dt>Price checked</dt><dd>${checkedLabel(deal.checked)}</dd>
          <dt>Checked at</dt><dd>${escapeHtml(deal.source)}</dd>
          <dt>Store</dt><dd>${escapeHtml(deal.store)}</dd>
        </dl>
      </div>
    </div>
  </div>`;
}

export function statsHtml(stats) {
  return `
    <div class="stat"><strong>${stats.total}</strong><span>verified deals</span></div>
    <div class="stat"><strong>${stats.avg}%</strong><span>average discount</span></div>
    <div class="stat"><strong>$${stats.saved.toLocaleString("en-US")}</strong><span>total savings if you bought one of each</span></div>
    <div class="stat"><strong>${stats.newLows}</strong><span>all-time lows</span></div>`;
}
