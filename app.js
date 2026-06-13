/* PLASMAE // SPECIMEN ARCHIVE — gallery logic */
(async function () {
  const grid   = document.getElementById("grid");
  const bar    = document.getElementById("filters");
  const count  = document.getElementById("count");
  const lb      = document.getElementById("lb");
  const lbImg   = document.getElementById("lb-img");
  const lbName  = document.getElementById("lb-name");
  const lbSub   = document.getElementById("lb-sub");
  const lbKick  = document.getElementById("lb-kicker");
  const lbDl    = document.getElementById("lb-dl");

  let specimens = [];
  let active = "all";

  try {
    const res = await fetch("manifest.json", { cache: "no-store" });
    const data = await res.json();
    specimens = data.specimens || [];
  } catch (e) {
    grid.innerHTML = '<p style="color:#d6603a">[ERR] manifest.json could not be loaded. ' +
      'Serve this folder over http (e.g. <code>python -m http.server</code>), not file://</p>';
    return;
  }

  const styles = ["all", ...Array.from(new Set(specimens.map(s => s.style)))];
  bar.innerHTML =
    '<span class="label">FILTER //</span>' +
    styles.map(s =>
      `<button class="chip${s === "all" ? " active" : ""}" data-style="${s}">${s}</button>`
    ).join("") +
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
    document.getElementById("count").textContent =
      `${String(list.length).padStart(3, "0")} SPECIMENS`;
    grid.innerHTML = list.map(s => `
      <article class="card" data-id="${s.id}">
        <div class="frame">
          <span class="tag">${s.id}</span>
          <img src="${s.src}" alt="${s.name}" loading="lazy">
        </div>
        <div class="meta">
          <div class="sci">${s.name}</div>
          <div class="common">${s.common}</div>
          <div class="row"><span class="style">${s.style}</span><span>${s.date}</span></div>
        </div>
      </article>`).join("");
  }

  grid.addEventListener("click", e => {
    const card = e.target.closest(".card");
    if (!card) return;
    const s = specimens.find(x => x.id === card.dataset.id);
    if (!s) return;
    lbImg.src = s.src;
    lbKick.textContent = s.id;
    lbName.textContent = s.name;
    lbSub.textContent = s.common;
    lbDl.innerHTML =
      `<dt>STYLE</dt><dd>${s.style}</dd>` +
      `<dt>CATALOGUED</dt><dd>${s.date}</dd>` +
      `<dt>STATUS</dt><dd style="color:#38e0b0">VIABLE</dd>` +
      `<dt>ORIGIN</dt><dd>Plasmae Lab</dd>`;
    lb.classList.add("open");
  });

  function closeLb() { lb.classList.remove("open"); lbImg.src = ""; }
  lb.addEventListener("click", e => { if (e.target === lb || e.target.id === "lb-close") closeLb(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape") closeLb(); });

  render();
})();
