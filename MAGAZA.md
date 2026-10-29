# Chrome Web Store gönderimi (sürüm 1.0.0, ücretsiz)

Yüklenecek paket: `zoom-otomatik-eklenti.zip`
Ekran görüntüleri (1280x800):
- Türkçe: `magaza-gorselleri/tr-ekran-1-liste.png`, `magaza-gorselleri/tr-ekran-2-form.png`
- İngilizce: `magaza-gorselleri/en-ekran-1-liste.png`, `magaza-gorselleri/en-ekran-2-form.png`

Eklenti iki dilli: tarayıcı Türkçe ise Türkçe, değilse İngilizce açılır. Varsayılan dil İngilizce (`default_locale: en`).
Mağaza girişinde önce İngilizce (varsayılan) doldurulur, sonra dil listesinden Türkçe eklenip Türkçe metin ve görseller girilir.
Mağaza simgesi: `eklenti/ikon128.png`
Gizlilik politikası: https://otozoom.tools-to2.workers.dev/gizlilik.html (herkese açık)
Tanıtım sitesi: https://otozoom.tools-to2.workers.dev (kaynak ~/otozoom-site, yayın ./yayinla.sh)

## Mağaza girişi (Store listing)

**Ad:** Türkçe "OtoZoom", İngilizce "OtoZoom" (manifest'ten gelir)

**Kısa açıklama:** Zoom derslerine seçtiğin gün ve saatte kendi hesabınla, kamera ve mikrofon kapalı olarak otomatik katılır.

**Ayrıntılı açıklama:**

Derslerini bir kez ekle; ders saati gelince eklenti Zoom toplantısını senin yerine açsın.

• Seçtiğin günlerde, ders saatinden sonraki 10 dakika içinde toplantıya otomatik katılır.
• Tarayıcıda açık olan kendi Zoom hesabınla girer; toplantı şifresi sorulursa kaydettiğin şifreyi yazar ve Katıl'a basar.
• Girişte kamera ya da mikrofon açıksa ilk 60 saniye içinde kapatır.
• Açık bir Zoom sekmesi varsa toplantıyı o sekmede açar.
• Toplantı kimliği ve şifresiyle ya da davet linkiyle çalışır; zoom.us/my/... kişisel linkleri de desteklenir.
• Toplantıları düzenleyebilir, geçici olarak kapatabilir ya da "Katıl" ile hemen girebilirsin.
• Zoom'un web sürümünü kullanır, masaüstü uygulaması gerekmez.

Tüm bilgiler yalnızca senin tarayıcında saklanır, hiçbir sunucuya gönderilmez.
Not: Eklentinin çalışması için tarayıcının açık olması gerekir.

OtoZoom bağımsız bir eklentidir; Zoom Video Communications ile bağlantısı yoktur.

**Kategori:** Verimlilik → İletişim (Productivity / Communication)
**Diller:** İngilizce (varsayılan), Türkçe

## Gizlilik uygulamaları (Privacy practices)

**Tek amaç:** Kullanıcının planladığı Zoom toplantılarına belirlenen gün ve saatte otomatik katılmak.

**İzin gerekçeleri:**
- **alarms:** Toplantı saatini dakikada bir kontrol etmek için.
- **storage:** Kullanıcının eklediği toplantıları tarayıcıda yerel olarak saklamak için.
- **notifications:** Toplantıya katılınırken kullanıcıya bildirim göstermek için.
- **activeTab, scripting:** Eklenti simgesine basıldığında, yalnız o an açık sekmede eklenti panelini sayfanın üstünde yüzen bir pencere olarak göstermek için. Sayfanın içeriği okunmaz.
- **Ana makine izni (https://*.zoom.us/*):** Toplantıyı açık Zoom sekmesinde açmak; Zoom katılma sayfasında kullanıcının kaydettiği şifreyi girip Katıl düğmesine basmak; toplantıya girişte açık kalan kamera ve mikrofonu kapatmak. Yalnızca zoom.us sayfalarında çalışır.

**Uzak kod kullanıyor musunuz?** Hayır.

**Veri kullanımı:** Eklenti hiçbir kullanıcı verisini toplamaz ya da cihazdan dışarı göndermez; tüm kutular boş bırakılır. Alttaki üç beyan işaretlenir (veri satılmaz, amaç dışı kullanılmaz, kredi için kullanılmaz).

**Gizlilik politikası URL'si:** https://otozoom.tools-to2.workers.dev/gizlilik.html

## Dağıtım
- Görünürlük: Herkese açık
- Bölgeler: Tüm bölgeler
- Fiyat: Ücretsiz (abonelik sonraki sürümde, `ayar.js` içindeki `PRO_SATISI: true` ile açılacak)

## Abonelik açıldığında (PRO_SATISI: true)

Eklenti kurulduğu andan itibaren 7 gün her şey açık çalışır. Süre bitince abonelik gerekir; abonelik yoksa otomatik katılım ve kamera/mikrofon kapatma durur, elle "Katıl" çalışmaya devam eder.

Lemon Squeezy'de: aylık **abonelik** ürünü oluştur, "Generate license keys" açık olsun. Store ID, Product ID ve checkout linkini `ayar.js`'ye yaz, `PRO_SATISI: true` yap, sürümü 1.1.0'a çıkar.

Mağaza açıklamalarının en üstüne eklenecek satır:
- TR: **7 gün ücretsiz dene, sonra aylık abonelikle kullanmaya devam et.**
- EN: **Try it free for 7 days, then continue with a monthly subscription.**

Mağaza formunda "Uygulama içi satın alma" (In-app purchases) seçeneği işaretlenir.

---

# English store listing (default language)

**Name:** OtoZoom (from the manifest)

**Summary:** Automatically joins your Zoom classes on the days and times you choose, with your own account and your camera and mic off.

**Description:**

Add your classes once, and when class time comes the extension opens the Zoom meeting for you.

• Joins automatically on the days you choose, within 10 minutes of the start time.
• Uses your own Zoom account signed in to this browser; if a passcode is requested, it enters the one you saved and presses Join.
• If your camera or microphone is on when you join, it turns them off within the first 60 seconds.
• If a Zoom tab is already open, it opens the meeting in that tab.
• Works with a meeting ID and passcode or an invite link, including zoom.us/my/... personal links.
• Edit meetings, pause them, or join right away with "Join".
• Uses Zoom's web client, so the Zoom desktop app isn't required.

All information stays in your browser and is never sent to a server.
Note: your browser must be open for the extension to work.

OtoZoom is an independent extension and is not affiliated with Zoom Video Communications.

**Category:** Productivity → Communication

## Privacy practices (English)

**Single purpose:** Automatically join the user's scheduled Zoom meetings on the chosen days and times.

**Permission justifications:**
- **alarms:** To check the meeting schedule once a minute.
- **storage:** To store the user's meetings locally in the browser.
- **notifications:** To notify the user when a meeting is being joined.
- **activeTab, scripting:** When the user clicks the extension icon, to show the extension panel as a floating window on top of the current tab only. Page content is not read.
- **Host permission (https://*.zoom.us/*):** To open the meeting in an existing Zoom tab; on Zoom's join page, to enter the passcode the user saved and press Join; and to turn off the camera and microphone if they are on when joining. Runs only on zoom.us pages.

**Remote code:** No.

**Data usage:** The extension does not collect or transmit any user data; leave all data types unchecked and tick the three certifications.

**Privacy policy URL:** https://otozoom.tools-to2.workers.dev/gizlilik.html (Turkish and English on one page)
