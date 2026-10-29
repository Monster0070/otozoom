// Eklentinin açtığı Zoom sayfasında katılmayı tamamlar:
// "Tarayıcıdan katıl" bağlantısına gider, şifre sorulursa girer, Katıl düğmesine basar.
(() => {
  const BITIS = Date.now() + 180000;
  let sonTik = 0;

  function yaz(input, deger) {
    const ayarla = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set;
    ayarla.call(input, deger);
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
  }

  const metin = (e) => (e.textContent || "").trim().toLowerCase();

  async function bekleyenAl() {
    const { bekleyen } = await chrome.storage.local.get("bekleyen");
    if (!bekleyen || Date.now() - bekleyen.zaman > 600000) return null;
    const kimlik = (location.pathname.match(/\d{9,}/) || [])[0];
    if (bekleyen.kimlik && kimlik && bekleyen.kimlik !== kimlik) return null;
    return bekleyen;
  }

  const zaman = setInterval(async () => {
    if (Date.now() > BITIS) return clearInterval(zaman);
    const bekleyen = await bekleyenAl();
    if (!bekleyen) return;

    // zoom.us/j/... ya da /my/... açılış sayfası: tarayıcıdan katıl
    if (!location.pathname.startsWith("/wc/")) {
      const a = [...document.querySelectorAll("a[href]")].find(
        (x) => x.href.includes("/wc/join/") || /join from (your )?browser|tarayıcı/.test(metin(x))
      );
      if (a) { clearInterval(zaman); location.href = a.href; }
      return;
    }

    const sifre = document.querySelector('#input-for-pwd, input[type="password"]');
    if (sifre && !sifre.value && bekleyen.sifre) yaz(sifre, bekleyen.sifre);

    // Katıl düğmesi (önizleme ve şifre sayfası); 3 sn'de bir en çok
    if (Date.now() - sonTik < 3000) return;
    const dugme = [...document.querySelectorAll("button")].find(
      (b) => !b.disabled && b.offsetParent !== null &&
        (/preview-join-button|joinBtn/i.test(b.className) || /^(join|katıl|toplantıya katıl)$/.test(metin(b)))
    );
    if (dugme) { sonTik = Date.now(); dugme.click(); }
  }, 700);
})();
