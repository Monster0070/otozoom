dilUygula();
const GUN_ADLARI = M.gunler;
const SIRA = [1, 2, 3, 4, 5, 6, 0];
const $ = (id) => document.getElementById(id);
const DUZENLE_IKON = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10.5 2.5l3 3L6 13H3v-3z"/></svg>';
let duzenlenen = null;
const SIL_IKON ='<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><path d="M3 4.5h10M6.5 4.5V3h3v1.5M4.5 4.5l.6 8.5h5.8l.6-8.5"/></svg>';

$("gunler").innerHTML = SIRA.map(
  (g) => `<label><input type="checkbox" value="${g}"><span>${GUN_ADLARI[g]}</span></label>`
).join("");

async function al() {
  return (await chrome.storage.local.get("toplantilar")).toplantilar || [];
}
const kaydet = (toplantilar) => chrome.storage.local.set({ toplantilar });

// Pro lisansı
let pro = false;
const SINIR = AYAR.UCRETSIZ_TOPLANTI_SINIRI;

// pro: tam kullanım (satış kapalı, abone ya da deneme sürüyor)
async function proCiz() {
  const { lisans } = await chrome.storage.local.get("lisans");
  const abone = !!(lisans && lisans.gecerli);
  const kalan = await denemeKalanGun();
  pro = !AYAR.PRO_SATISI || abone || kalan > 0;
  $("pro").hidden = !AYAR.PRO_SATISI;
  $("proOnEk").hidden = true;
  $("proUcretsiz").hidden = abone;
  $("proEtkin").hidden = !abone;
  $("proDurum").textContent = kalan > 0 ? M.denemeSuruyor : M.denemeBitti;
  $("proRozet").textContent = kalan > 0 ? M.gunKaldi(kalan) : M.rozetBitti;
  $("proMetin").textContent = kalan > 0 ? M.denemeTanitim : M.bittiTanitim;
}

function proyaGit(mesaj) {
  tost(mesaj);
  $("pro").scrollIntoView({ behavior: "smooth", block: "center" });
  $("pro").classList.remove("vurgu");
  void $("pro").offsetWidth;
  $("pro").classList.add("vurgu");
}

$("satinAl").addEventListener("click", () => chrome.tabs.create({ url: AYAR.SATIN_AL_LINKI }));

$("etkinlestir").addEventListener("click", async () => {
  $("lisansHata").textContent = "";
  $("etkinlestir").disabled = true;
  $("etkinlestir").textContent = M.kontrolEdiliyor;
  const c = (await chrome.runtime.sendMessage({ tip: "lisansEtkinlestir", anahtar: $("lisansAnahtari").value })) || {};
  $("etkinlestir").disabled = false;
  $("etkinlestir").textContent = M.etkinlestir;
  if (!c.tamam) {
    $("lisansHata").textContent = (c.hata && M[c.hata]) || M.etkinlesmedi;
    return;
  }
  $("lisansAnahtari").value = "";
  await proCiz();
  tost(M.proAcildi);
  ciz();
});

$("lisansKaldir").addEventListener("click", async () => {
  await chrome.runtime.sendMessage({ tip: "lisansKaldir" });
  await proCiz();
  tost(M.lisansKaldirildi);
  ciz();
});

// Bildirim
let tostZaman, geriAl;
function tost(metin, geri) {
  $("tostMetin").textContent = metin;
  geriAl = geri;
  $("tostGeri").hidden = !geri;
  $("tost").classList.add("goster");
  clearTimeout(tostZaman);
  tostZaman = setTimeout(() => $("tost").classList.remove("goster"), 4000);
}
$("tostGeri").addEventListener("click", async () => {
  $("tost").classList.remove("goster");
  if (geriAl) await geriAl();
});

// Sıradaki toplantı ve geri sayım
function siradaki(liste) {
  const simdi = new Date();
  let en = null;
  for (const t of liste) {
    if (!t.aktif) continue;
    const [s, d] = t.saat.split(":").map(Number);
    for (let i = 0; i < 8; i++) {
      const z = new Date(simdi);
      z.setDate(z.getDate() + i);
      z.setHours(s, d, 0, 0);
      if (z > simdi && t.gunler.includes(z.getDay())) {
        if (!en || z < en.z) en = { t, z };
        break;
      }
    }
  }
  return en;
}

function sure(ms) {
  const dk = Math.ceil(ms / 60000);
  const g = Math.floor(dk / 1440), sa = Math.floor((dk % 1440) / 60), d = dk % 60;
  if (g) return M.gunSonra(g, sa);
  if (sa) return M.saSonra(sa, d);
  return M.dkSonra(d);
}

let sonListe = [];
function ustuGuncelle() {
  const s = siradaki(pro ? sonListe : sonListe.slice(0, SINIR));
  $("kamera").classList.toggle("bos", !s);
  if (!s) {
    $("siradakiAd").textContent = sonListe.length ? M.aktifYok : M.henuzYok;
    $("geriSayim").textContent = "";
    return;
  }
  $("siradakiAd").textContent = s.t.ad;
  const saat = s.z.toLocaleTimeString(M.yerel, { hour: "2-digit", minute: "2-digit" });
  $("geriSayim").textContent = `${GUN_ADLARI[s.z.getDay()]} ${saat} · ${sure(s.z - new Date())}`;
}
setInterval(ustuGuncelle, 30000);

async function ciz() {
  sonListe = await al();
  ustuGuncelle();
  const ul = $("liste");
  ul.innerHTML = "";
  if (!sonListe.length) {
    ul.innerHTML = '<li class="bos-durum" style="display:block"></li>';
    ul.firstChild.textContent = M.bosListe;
    return;
  }
  sonListe.forEach((t, i) => {
    const li = document.createElement("li");
    li.style.setProperty("--i", i);
    li.classList.toggle("pasif", !t.aktif);
    const gunler = SIRA.filter((g) => t.gunler.includes(g)).map((g) => GUN_ADLARI[g]).join(", ");
    li.innerHTML = `<div><div class="ad"></div><div class="zaman">${gunler} · ${t.saat}${!pro && i >= SINIR ? ' · <span class="pro-gerek">${M.proGerek}</span>' : ""}</div></div>
      <div class="eylemler">
        <label class="anahtar"><input type="checkbox" ${t.aktif ? "checked" : ""}><span></span></label>
        <button class="simdi">${M.katil}</button>
        <button class="duzenle">${DUZENLE_IKON}</button>
        <button class="sil">${SIL_IKON}</button>
      </div>`;
    li.querySelector(".ad").textContent = t.ad;
    li.querySelector(".anahtar input").setAttribute("aria-label", M.otomatikKatilim(t.ad));
    li.querySelector(".simdi").setAttribute("aria-label", M.simdiKatil(t.ad));
    li.querySelector(".sil").setAttribute("aria-label", M.silAria(t.ad));
    li.querySelector(".duzenle").setAttribute("aria-label", M.duzenleAria(t.ad));
    li.dataset.id = t.id;
    li.classList.toggle("duzenleniyor", duzenlenen === t.id);
    li.querySelector(".duzenle").addEventListener("click", () => formuAc(t));

    li.querySelector(".anahtar input").addEventListener("change", async (e) => {
      const liste = await al();
      const k = liste.findIndex((x) => x.id === t.id);
      liste[k].aktif = e.target.checked;
      await kaydet(liste);
      li.classList.toggle("pasif", !e.target.checked);
      sonListe = liste;
      ustuGuncelle();
    });
    li.querySelector(".simdi").addEventListener("click", () => {
      chrome.runtime.sendMessage({ tip: "simdi", toplanti: t });
      tost(M.aciliyor(t.ad));
    });
    li.querySelector(".sil").addEventListener("click", async () => {
      li.classList.add("cikiyor");
      if (duzenlenen === t.id) formuKapat();
      const liste = await al();
      const k = liste.findIndex((x) => x.id === t.id);
      const [silinen] = liste.splice(k, 1);
      await kaydet(liste);
      setTimeout(ciz, 180);
      tost(M.silindi(t.ad), async () => {
        const l = await al();
        l.splice(k, 0, silinen);
        await kaydet(l);
        ciz();
      });
    });
    ul.appendChild(li);
  });
}

// Form aç/kapa; t verilirse o toplantı düzenlenir
function formuAc(t) {
  $("form").reset();
  duzenlenen = t ? t.id : null;
  if (t) {
    $("ad").value = t.ad;
    $("saat").value = t.saat;
    $("kimlik").value = t.kimlik || "";
    $("sifre").value = t.sifre || "";
    $("link").value = t.link || "";
    document.querySelectorAll("#gunler input").forEach((c) => (c.checked = t.gunler.includes(+c.value)));
  }
  $("kaydet").textContent = t ? M.kaydet : M.ekle;
  $("iptal").hidden = !t;
  $("acKapaMetin").textContent = t ? M.duzenleniyor(t.ad) : M.yeniToplanti;
  $("acilir").classList.add("acik");
  $("acKapa").setAttribute("aria-expanded", true);
  document.querySelectorAll("#liste li").forEach((li) => li.classList.remove("duzenleniyor"));
  if (t) document.querySelector(`#liste li[data-id="${t.id}"]`)?.classList.add("duzenleniyor");
  $("acKapa").scrollIntoView({ behavior: "smooth", block: "start" });
  setTimeout(() => $("ad").focus(), 200);
}

function formuKapat() {
  $("form").reset();
  duzenlenen = null;
  $("kaydet").textContent = M.ekle;
  $("iptal").hidden = true;
  $("acKapaMetin").textContent = M.yeniToplanti;
  $("acilir").classList.remove("acik");
  $("acKapa").setAttribute("aria-expanded", false);
  document.querySelectorAll("#liste li").forEach((li) => li.classList.remove("duzenleniyor"));
}

$("acKapa").addEventListener("click", () => {
  if ($("acilir").classList.contains("acik")) formuKapat();
  else if (!pro && sonListe.length >= SINIR) proyaGit(M.denemeBittiUyari);
  else formuAc(null);
});
$("iptal").addEventListener("click", formuKapat);

$("form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const gunler = [...document.querySelectorAll("#gunler input:checked")].map((c) => +c.value);
  const kimlik = $("kimlik").value.trim();
  const link = $("link").value.trim();
  if (!gunler.length) return tost(M.gunSec);
  if (!kimlik && !link) return tost(M.kimlikGir);
  const liste = await al();
  const veri = { ad: $("ad").value.trim(), gunler, saat: $("saat").value, kimlik, sifre: $("sifre").value, link };
  const k = liste.findIndex((x) => x.id === duzenlenen);
  if (k < 0 && !pro && liste.length >= SINIR) return proyaGit(M.denemeBittiUyari);
  if (k >= 0) liste[k] = { ...liste[k], ...veri };
  else liste.push({ id: crypto.randomUUID(), ...veri, aktif: true });
  await kaydet(liste);
  tost(k >= 0 ? M.kaydedildi : M.eklendi);
  formuKapat();
  ciz();
});

proCiz().then(ciz);
