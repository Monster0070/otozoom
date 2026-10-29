// Her dakika toplantı saatlerini kontrol eder, zamanı gelene katılır.
importScripts("dil.js", "ayar.js", "lisans.js");
const TOLERANS_DK = 10;

chrome.runtime.onInstalled.addListener(kur);
chrome.runtime.onStartup.addListener(kur);
function kur() {
  chrome.alarms.create("kontrol", { periodInMinutes: 1 });
  chrome.alarms.create("lisans", { periodInMinutes: 360 });
  denemeKalanGun().then(kontrol);
  lisansDogrula(false);
}

chrome.alarms.onAlarm.addListener((a) => {
  if (a.name === "kontrol") kontrol();
  if (a.name === "lisans") lisansDogrula(false);
});

chrome.runtime.onMessage.addListener((m, _, cevapla) => {
  if (m.tip === "simdi") katil(m.toplanti);
  if (m.tip === "lisansEtkinlestir") { lisansEtkinlestir(m.anahtar).then(cevapla); return true; }
  if (m.tip === "lisansKaldir") { lisansKaldir().then(() => cevapla({ tamam: true })); return true; }
});

// Zoom'un web sürümüyle, tarayıcıda açık olan Zoom hesabınla katılınır.
function kimlikBul(t) {
  if (t.link) {
    const m = t.link.match(/\/(?:j|wc\/join|wc)\/(\d{9,})/);
    if (m) return m[1];
  }
  return (t.kimlik || "").replace(/\D/g, "");
}

function zoomUrl(t, kimlik) {
  let pwd = t.sifre;
  if (t.link) {
    try { pwd = new URL(t.link).searchParams.get("pwd") || pwd; } catch {}
  }
  return `https://app.zoom.us/wc/join/${kimlik}` + (pwd ? `?pwd=${encodeURIComponent(pwd)}` : "");
}

// Açık bir Zoom sekmesi varsa onda açar (toplantıda olmayanı tercih eder), yoksa yeni sekme
async function sekmedeAc(url) {
  const sekmeler = await chrome.tabs.query({ url: "https://*.zoom.us/*" });
  const sekme = sekmeler.find((s) => !new URL(s.url).pathname.startsWith("/wc/")) || sekmeler[0];
  if (!sekme) return chrome.tabs.create({ url });
  await chrome.tabs.update(sekme.id, { url, active: true });
  await chrome.windows.update(sekme.windowId, { focused: true });
}

async function katil(t) {
  const kimlik = kimlikBul(t);
  // zoom.us/my/hoca gibi numarasız linkler olduğu gibi açılır, giris.js tarayıcıdan katılır
  const url = kimlik ? zoomUrl(t, kimlik) : t.link;
  if (!url) return;
  // Sayfa şifre sorarsa giris.js bunu doldurur
  await chrome.storage.local.set({ bekleyen: { kimlik, sifre: t.sifre || "", zaman: Date.now() } });
  await sekmedeAc(url);
  chrome.notifications.create({
    type: "basic",
    iconUrl: "ikon128.png",
    title: M.bildirimBaslik,
    message: t.ad || t.kimlik,
  });
}

async function kontrol() {
  const { toplantilar = [], katilinanlar = {} } = await chrome.storage.local.get(["toplantilar", "katilinanlar"]);
  // Deneme bitmiş ve abonelik yoksa yalnız listedeki ilk toplantılar (sınır kadar) otomatik katılır
  const izinli = (await erisimVar()) ? toplantilar : toplantilar.slice(0, AYAR.UCRETSIZ_TOPLANTI_SINIRI);
  const simdi = new Date();
  for (const t of izinli) {
    if (!t.aktif || !t.gunler.includes(simdi.getDay())) continue;
    const [s, d] = t.saat.split(":").map(Number);
    const bas = new Date(simdi);
    bas.setHours(s, d, 0, 0);
    const fark = (simdi - bas) / 60000;
    if (fark < 0 || fark >= TOLERANS_DK) continue;
    const anahtar = t.id + "|" + bas.toISOString();
    if (katilinanlar[anahtar]) continue;
    katilinanlar[anahtar] = Date.now();
    await katil(t);
  }
  // 7 günden eski kayıtları sil
  const sinir = Date.now() - 7 * 864e5;
  for (const k in katilinanlar) if (katilinanlar[k] < sinir) delete katilinanlar[k];
  await chrome.storage.local.set({ katilinanlar });
}

// Simgeye basınca: açık sayfada yüzen panel; tarayıcının izin vermediği sayfalarda (yeni sekme, brave:// vb.) küçük ayrı pencere
chrome.action.onClicked.addListener(async (tab) => {
  try {
    await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ["panel.js"] });
  } catch {
    chrome.windows.create({ url: chrome.runtime.getURL("popup.html"), type: "popup", width: 376, height: 640 });
  }
});
