// Eklenti simgesine basınca açık sayfanın sağ üstünde, bardan biraz aşağıda yüzen, yuvarlak köşeli panel açar.
// Tekrar basınca, dışına tıklayınca ya da Esc'e basınca kapanır. İçeriği popup.html (iframe).
(async () => {
  const ID = "otozoom-yuzen-panel";
  if (document.getElementById(ID)) { window.__ozKapat && window.__ozKapat(); return; }
  if (window.__ozAciliyor) return;   // hızlı çift tıklamada ikinci panel açılmasın
  window.__ozAciliyor = true;

  // Tek kullanımlık anahtar: panel sayfası yalnız bu panelin içinde açılır, başka siteler gömemez
  const anahtar = crypto.randomUUID();
  await chrome.storage.local.set({ yuzenAnahtar: anahtar });

  const kok = document.createElement("div");
  kok.id = ID;
  const golge = kok.attachShadow({ mode: "closed" });
  golge.innerHTML = `<style>
    :host { all: initial; position: fixed; top: 10px; right: 12px; z-index: 2147483647; }
    .kutu {
      width: 360px; height: var(--h, 560px); max-height: calc(100vh - 20px);
      border-radius: 16px; overflow: hidden; background: transparent;
      box-shadow: 0 18px 50px rgba(0, 0, 0, .28), 0 0 0 1px rgba(0, 0, 0, .08);
      transform-origin: top right; animation: ac .22s cubic-bezier(.16, 1, .3, 1);
    }
    .kutu.kapan { animation: kp .14s ease-in forwards; }
    iframe { border: 0; width: 100%; height: 100%; display: block; }
    @keyframes ac { from { opacity: 0; transform: translateY(-6px) scale(.97); } }
    @keyframes kp { to { opacity: 0; transform: translateY(-4px) scale(.98); } }
    @media (prefers-reduced-motion: reduce) { .kutu, .kutu.kapan { animation: none; } }
  </style><div class="kutu"><iframe src="${chrome.runtime.getURL("popup.html")}?yuzen=1#${anahtar}" title="OtoZoom"></iframe></div>`;
  document.documentElement.appendChild(kok);
  window.__ozAciliyor = false;

  const kutu = golge.querySelector(".kutu");
  const cerceve = golge.querySelector("iframe");

  const disari = (e) => { if (!e.composedPath().includes(kok)) kapat(); };
  const tus = (e) => { if (e.key === "Escape") kapat(); };
  const mesaj = (e) => {
    if (e.source !== cerceve.contentWindow) return;   // yalnız kendi panelimizden gelen mesajlar
    const m = e.data || {};
    if (m.oz === "boy" && m.h > 0) kutu.style.setProperty("--h", Math.ceil(m.h) + "px");
    if (m.oz === "kapat") kapat();
  };
  function kapat() {
    removeEventListener("pointerdown", disari, true);
    removeEventListener("keydown", tus, true);
    removeEventListener("message", mesaj);
    window.__ozKapat = null;
    kutu.classList.add("kapan");
    setTimeout(() => kok.remove(), 150);
  }
  window.__ozKapat = kapat;
  addEventListener("pointerdown", disari, true);
  addEventListener("keydown", tus, true);
  addEventListener("message", mesaj);
})();
