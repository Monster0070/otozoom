// Zoom web toplantısında mikrofon ya da kamera açıksa kapatır.
// Düğme adı "mute..." / "stop ... video" ise o şey açıktır; yalnız o zaman tıklanır.
// Kontroller ilk göründükten sonra 60 sn denetlenir; sonra kullanıcı açarsa karışılmaz.
// Satış açıksa yalnız abonelerde ve deneme süresince çalışır.
chrome.storage.local.get(["lisans", "denemeBaslangic"]).then(({ lisans, denemeBaslangic }) => {
  const deneme = denemeBaslangic && Date.now() - denemeBaslangic < AYAR.DENEME_GUN * 864e5;
  if (!AYAR.PRO_SATISI || (lisans && lisans.gecerli) || deneme) kapatici();
});

function kapatici() {
  const SURE = 60000;
  let bas = null;

  const etiket = (b) => (b.getAttribute("aria-label") || "").toLowerCase().trim();
  const mikrofonAcik = (e) => /^mute( my)?( microphone| audio)?$/.test(e);
  const kameraAcik = (e) => /^(stop|turn off)( my)? video$/.test(e);
  const kontrol = (e) => /microphone|audio|video/.test(e) && !/more|settings/.test(e);

  function tara() {
    const dugmeler = [...document.querySelectorAll("button[aria-label]")];
    if (!dugmeler.some((b) => kontrol(etiket(b)))) {
      bas = null; // bekleme odası ya da toplantı dışı
      return;
    }
    if (bas === null) bas = Date.now();
    if (Date.now() - bas > SURE) return;
    for (const b of dugmeler) {
      const e = etiket(b);
      if (mikrofonAcik(e) || kameraAcik(e)) b.click();
    }
  }

  setInterval(tara, 500);
}
