// DealRadar filtering, sorting and verdict scoring.
// Pure functions over the deals array — no DOM here, so the logic is easy to
// test and easy for a reader to follow.

export function discountOf(deal) {
  if (!deal.was || deal.was <= 0) return 0;
  return Math.round(((deal.was - deal.price) / deal.was) * 100);
}

export function savingOf(deal) {
  return Math.round((deal.was - deal.price) * 100) / 100;
}

export function verdictLabel(verdict) {
  if (verdict === "new-low") return "REAL DEAL · NEW LOW";
  if (verdict === "strong") return "REAL DEAL · STRONG PRICE";
  return "REAL DEAL · MODEST CUT";
}

export function verdictRank(verdict) {
  if (verdict === "new-low") return 0;
  if (verdict === "strong") return 1;
  return 2;
}

// Score a deal for the "Best first" sort: new lows first, then biggest
// percentage cut, then biggest dollar saving.
export function dealScore(deal) {
  return verdictRank(deal.verdict) * -1000 + discountOf(deal) * 10 + savingOf(deal) / 100;
}

export function filterDeals(all, opts) {
  const q = (opts.query || "").trim().toLowerCase();
  const minPct = Number(opts.minDiscount || 0);
  return all.filter((deal) => {
    if (opts.category && opts.category !== "All" && deal.category !== opts.category) return false;
    if (opts.store && opts.store !== "All" && deal.store !== opts.store) return false;
    if (discountOf(deal) < minPct) return false;
    if (opts.verdict && opts.verdict !== "all" && deal.verdict !== opts.verdict) return false;
    if (q) {
      const hay = `${deal.title} ${deal.store} ${deal.category} ${deal.source}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

export function sortDeals(list, sortKey) {
  const out = [...list];
  if (sortKey === "saving") out.sort((a, b) => savingOf(b) - savingOf(a));
  else if (sortKey === "percent") out.sort((a, b) => discountOf(b) - discountOf(a));
  else if (sortKey === "price-low") out.sort((a, b) => a.price - b.price);
  else if (sortKey === "price-high") out.sort((a, b) => b.price - a.price);
  else out.sort((a, b) => dealScore(b) - dealScore(a)); // "best" is the default
  return out;
}

export function statsFor(all) {
  const total = all.length;
  const pcts = all.map(discountOf);
  const avg = total ? Math.round(pcts.reduce((s, p) => s + p, 0) / total) : 0;
  const saved = all.reduce((s, d) => s + savingOf(d), 0);
  const newLows = all.filter((d) => d.verdict === "new-low").length;
  return { total, avg, saved: Math.round(saved), newLows };
}
