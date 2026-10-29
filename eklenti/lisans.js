// Lemon Squeezy lisans anahtarı: etkinleştirme, haftalık doğrulama ve kaldırma.
// Bu uç noktalar API anahtarı istemez; anahtarın bu ürüne ait olduğu meta'dan denetlenir.
const LS_API = "https://api.lemonsqueezy.com/v1/licenses/";
const DOGRULAMA_ARALIGI = 7 * 864e5;

async function lsIstek(yol, alanlar) {
  const r = await fetch(LS_API + yol, {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(alanlar),
  });
  return r.json();
}

function buUrunMu(cevap) {
  const m = cevap.meta || {};
  return m.store_id === AYAR.MAGAZA_ID && m.product_id === AYAR.URUN_ID;
}

async function lisansAl() {
  return (await chrome.storage.local.get("lisans")).lisans || null;
}

async function proMu() {
  const l = await lisansAl();
  return !!(l && l.gecerli);
}

// İlk çağrıda deneme başlangıcını kaydeder; kalan gün sayısını döner.
async function denemeKalanGun() {
  let { denemeBaslangic } = await chrome.storage.local.get("denemeBaslangic");
  if (!denemeBaslangic) {
    denemeBaslangic = Date.now();
    await chrome.storage.local.set({ denemeBaslangic });
  }
  const kalan = AYAR.DENEME_GUN * 864e5 - (Date.now() - denemeBaslangic);
  return kalan > 0 ? Math.ceil(kalan / 864e5) : 0;
}

// Satış kapalıysa herkes; açıksa abone olan ya da denemesi sürenler tam kullanır
async function erisimVar() {
  return !AYAR.PRO_SATISI || (await proMu()) || (await denemeKalanGun()) > 0;
}

async function lisansEtkinlestir(anahtar) {
  anahtar = anahtar.trim();
  if (!anahtar) return { hata: "lisansGir" };
  let c;
  try {
    c = await lsIstek("activate", { license_key: anahtar, instance_name: "OtoZoom" });
  } catch {
    return { hata: "baglantiYok" };
  }
  if (!c.activated) {
    const e = (c.error || "").toLowerCase();
    if (e.includes("not found")) return { hata: "anahtarYok" };
    if (e.includes("limit")) return { hata: "cihazSiniri" };
    if (e.includes("expired") || e.includes("disabled")) return { hata: "sureDoldu" };
    return { hata: "etkinlesmez" };
  }
  if (!buUrunMu(c)) {
    try { await lsIstek("deactivate", { license_key: anahtar, instance_id: c.instance.id }); } catch {}
    return { hata: "baskaUrun" };
  }
  const lisans = { anahtar, ornekId: c.instance.id, gecerli: true, sonKontrol: Date.now() };
  await chrome.storage.local.set({ lisans });
  return { tamam: true };
}

// Haftada bir doğrular. İnternet yoksa lisans geçerli kalır; yalnız Lemon Squeezy reddederse kapanır.
async function lisansDogrula(zorla) {
  const l = await lisansAl();
  if (!l || (!zorla && Date.now() - l.sonKontrol < DOGRULAMA_ARALIGI)) return;
  let c;
  try {
    c = await lsIstek("validate", { license_key: l.anahtar, instance_id: l.ornekId });
  } catch {
    return;
  }
  l.gecerli = !!c.valid && buUrunMu(c) && ["active", "inactive"].includes(c.license_key?.status);
  l.sonKontrol = Date.now();
  await chrome.storage.local.set({ lisans: l });
}

async function lisansKaldir() {
  const l = await lisansAl();
  if (l) {
    try { await lsIstek("deactivate", { license_key: l.anahtar, instance_id: l.ornekId }); } catch {}
  }
  await chrome.storage.local.remove("lisans");
}
