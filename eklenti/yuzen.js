// popup.html bir çerçevenin içindeyse yalnız OtoZoom'un yüzen paneli olabilir: panel.js'in verdiği tek kullanımlık
// anahtar tutarsa görünür olur, boyunu panele bildirir, Esc ve window.close paneli kapatır; tutmazsa sayfa boşaltılır.
if (window.top !== window) {
  const anahtar = location.hash.slice(1);
  chrome.storage.local.get("yuzenAnahtar").then(({ yuzenAnahtar }) => {
    if (!anahtar || anahtar !== yuzenAnahtar) { document.documentElement.replaceChildren(); return; }
    chrome.storage.local.remove("yuzenAnahtar");
    document.documentElement.classList.add("yuzen");
    document.documentElement.style.visibility = "";
    const ust = (m) => parent.postMessage(m, "*");
    const bildir = () => ust({ oz: "boy", h: document.body.getBoundingClientRect().height });
    new ResizeObserver(bildir).observe(document.body);
    bildir();
    addEventListener("keydown", (e) => { if (e.key === "Escape") ust({ oz: "kapat" }); });
    window.close = () => ust({ oz: "kapat" });
  });
}
