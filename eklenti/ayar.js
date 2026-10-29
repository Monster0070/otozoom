// Lemon Squeezy mağaza bilgileri. Ürünü oluşturduktan sonra buraya yaz.
// Mağaza ve ürün numarası: Lemon Squeezy → Store ve Products sayfalarındaki "ID".
// Abonelik linki: aylık abonelik ürününün "Share" düğmesindeki checkout linki.
// Üründe "Generate license keys" açık olmalı; abonelik bitince anahtar geçersiz olur.
const AYAR = {
  // false: Pro satışı kapalı, tüm özellikler herkese açık ve Pro kartı gizli
  PRO_SATISI: false,
  MAGAZA_ID: 0,
  URUN_ID: 0,
  SATIN_AL_LINKI: "https://MAGAZAN.lemonsqueezy.com/buy/URUN",
  // Kurulumdan sonra bu kadar gün her şey açık; sonra abonelik gerekir
  DENEME_GUN: 7,
  // Deneme bitince aboneliği olmayanlarda otomatik katılan toplantı sayısı
  UCRETSIZ_TOPLANTI_SINIRI: 0,
};
