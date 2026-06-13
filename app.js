/* PLASMAE // SPECIMEN ARCHIVE — gallery logic */
(async function () {
  const grid  = document.getElementById("grid");
  const bar   = document.getElementById("filters");
  const lb     = document.getElementById("lb");
  const lbImg  = document.getElementById("lb-img");
  const lbName = document.getElementById("lb-name");
  const lbSub  = document.getElementById("lb-sub");
  const lbKick = document.getElementById("lb-kicker");
  const lbGen  = document.getElementById("lb-genome");
  const lbDl   = document.getElementById("lb-dl");
  const lbPr   = document.getElementById("lb-prompt");

  const esc = (s) => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  let specimens = [];
  let categories = [];
  let active = "all";

  // friendly chip label: pixel_biotech_romantic -> "bt romantic", pixel_biotech -> "bt"
  const catLabel = (k) =>
    k === "all" ? "all" :
    k === "pixel_biotech" ? "bt" :
    k.indexOf("pixel_biotech_") === 0 ? "bt " + k.slice("pixel_biotech_".length) :
    k;

  /* ---- deterministic "biology" derived from a specimen id ---- */
  const BASES = ["A", "T", "G", "C"];
  function hash(str) {                      // FNV-1a
    let h = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = (h * 0x01000193) >>> 0;
    }
    return h >>> 0;
  }
  function genome(seed, len) {
    let h = hash(seed), out = "";
    for (let i = 0; i < len; i++) { out += BASES[h & 3]; h = (h * 1103515245 + 12345) >>> 0; }
    return out;
  }
  function viability(seed) { return 72 + (hash(seed + "v") % 27); }   // 72..98 %
  function phOf(seed)      { return (6.8 + (hash(seed + "ph") % 9) / 10).toFixed(1); } // 6.8..7.6

  function seqHTML(seq) {
    return "<span class='seq'>" +
      seq.split("").map(b => `<i class="b-${b.toLowerCase()}">${b}</i>`).join("") +
      "</span>";
  }
  function viabilityHTML(pct) {
    const seg = Math.round(pct / 10);
    let cells = "";
    for (let i = 0; i < 10; i++) cells += `<i class="${i < seg ? "on" : ""}"></i>`;
    return `<span class="bar">${cells}</span><span class="pct">${pct}%</span>`;
  }

  try {
    const res = await fetch("manifest.json", { cache: "no-store" });
    const data = await res.json();
    specimens = data.specimens || [];
    categories = data.categories || [];
  } catch (e) {
    grid.innerHTML = '<p style="color:#ff5d8f">[ERR] manifest.json could not be loaded. ' +
      'Serve over http (python -m http.server), not file://</p>';
    return;
  }

  // predefined categories first, then any extra styles that show up in specimens
  const ordered = [];
  categories.concat(specimens.map(s => s.style)).forEach(k => {
    if (k && ordered.indexOf(k) === -1) ordered.push(k);
  });
  const styles = ["all", ...ordered];
  bar.innerHTML =
    '<span class="label">CULTURE //</span>' +
    styles.map(s => `<button class="chip${s === "all" ? " active" : ""}" data-style="${s}">${catLabel(s)}</button>`).join("") +
    '<span class="count" id="count"></span>';

  bar.addEventListener("click", e => {
    const chip = e.target.closest(".chip");
    if (!chip) return;
    active = chip.dataset.style;
    bar.querySelectorAll(".chip").forEach(c => c.classList.toggle("active", c === chip));
    render();
  });

  function render() {
    const list = specimens.filter(s => active === "all" || s.style === active);
    document.getElementById("count").textContent = `${String(list.length).padStart(3, "0")} VIABLE`;
    if (!list.length) {
      grid.innerHTML = '<p class="empty">[ ARCHIVE EMPTY ]<br>No specimens catalogued yet.<br>Culture one in the Plasmae bot and tap &#128247; Add to Gallery.</p>';
      return;
    }
    grid.innerHTML = list.map(s => {
      const pct = viability(s.id);
      return `
      <article class="card" data-id="${s.id}">
        <div class="frame">
          <span class="tag">${s.id}</span>
          <span class="led"></span>
          <span class="mag">40&times;</span>
          <img src="${s.src}" alt="${s.name}" loading="lazy">
        </div>
        <div class="meta">
          <div class="sci">${s.name}</div>
          <div class="common">${s.common}</div>
          ${seqHTML(genome(s.id, 22))}
          <div class="vital"><span class="vlabel">VIABILITY</span>${viabilityHTML(pct)}</div>
          <div class="row"><span class="style">&#9670; ${catLabel(s.style)}</span><span class="date">${s.date}</span></div>
        </div>
      </article>`;
    }).join("");
  }

  grid.addEventListener("click", e => {
    const card = e.target.closest(".card");
    if (!card) return;
    const s = specimens.find(x => x.id === card.dataset.id);
    if (!s) return;
    const pct = viability(s.id);
    lbImg.src = s.src;
    lbKick.textContent = s.id;
    lbName.textContent = s.name;
    lbSub.textContent = s.common;
    lbGen.innerHTML = `<div class="glabel">GENOME&nbsp;//&nbsp;5'&rarr;3'</div>${seqHTML(genome(s.id, 40))}`;
    lbDl.innerHTML =
      `<dt>CULTURE</dt><dd>${catLabel(s.style)}</dd>` +
      `<dt>VIABILITY</dt><dd style="color:#36e0a6">${pct}%</dd>` +
      `<dt>pH</dt><dd>${phOf(s.id)}</dd>` +
      `<dt>CONTAINMENT</dt><dd>BSL-2</dd>` +
      `<dt>CATALOGUED</dt><dd>${s.date}</dd>` +
      `<dt>STATUS</dt><dd style="color:#36e0a6">&#9670; VIABLE</dd>`;
    lbPr.innerHTML = s.prompt
      ? `<div class="glabel">PROMPT</div><div class="ptext">${esc(s.prompt)}</div>`
      : "";
    lb.classList.add("open");
  });

  function closeLb() { lb.classList.remove("open"); lbImg.src = ""; }
  lb.addEventListener("click", e => { if (e.target === lb || e.target.id === "lb-close") closeLb(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape") closeLb(); });

  render();
})();
