#!/usr/bin/env python3
"""toplantilar.json'daki gün/saatte Zoom toplantısına otomatik katılır.

launchd her dakika çalıştırır. Elle deneme:
    python3 zoom_katil.py            # zamanı gelen varsa katıl
    python3 zoom_katil.py simdi "Ad" # o toplantıya hemen katıl
"""
import datetime
import json
import subprocess
import sys
import urllib.parse
from pathlib import Path

KLASOR = Path(__file__).resolve().parent
AYAR = KLASOR / "toplantilar.json"
DURUM = KLASOR / ".katilinanlar.json"

GUNLER = {
    "pazartesi": 0, "sali": 1, "salı": 1, "carsamba": 2, "çarşamba": 2,
    "persembe": 3, "perşembe": 3, "cuma": 4, "cumartesi": 5, "pazar": 6,
}


def log(mesaj):
    zaman = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    with open(KLASOR / "zoom.log", "a", encoding="utf-8") as f:
        f.write(f"{zaman}  {mesaj}\n")
    print(mesaj)


def katil(t, gorunen_ad):
    kimlik = "".join(c for c in str(t["kimlik"]) if c.isdigit())
    if not kimlik:
        log(f"Atlandı (kimlik geçersiz): {t.get('ad')}")
        return False
    # Zoom masaüstü uygulaması yok: web sürümü tarayıcıda açılır
    url = f"https://app.zoom.us/wc/join/{kimlik}"
    if t.get("sifre"):
        url += "?pwd=" + urllib.parse.quote(t["sifre"])
    subprocess.run(["open", url], check=False)
    log(f"Katılınıyor: {t.get('ad')} ({kimlik})")
    return True


def main():
    ayar = json.loads(AYAR.read_text(encoding="utf-8"))
    gorunen_ad = ayar.get("gorunen_ad", "")
    toplantilar = ayar.get("toplantilar", [])

    if len(sys.argv) >= 3 and sys.argv[1] == "simdi":
        for t in toplantilar:
            if t.get("ad") == sys.argv[2]:
                katil(t, t.get("gorunen_ad", gorunen_ad))
                return
        print("Bu adla toplantı yok.")
        return

    tolerans = int(ayar.get("tolerans_dakika", 10))
    simdi = datetime.datetime.now()
    try:
        durum = json.loads(DURUM.read_text(encoding="utf-8"))
    except (FileNotFoundError, ValueError):
        durum = {}

    for t in toplantilar:
        gunler = {GUNLER.get(g.strip().lower()) for g in t.get("gunler", [])}
        if simdi.weekday() not in gunler:
            continue
        saat, dakika = map(int, t["saat"].split(":"))
        baslangic = simdi.replace(hour=saat, minute=dakika, second=0, microsecond=0)
        if not (baslangic <= simdi < baslangic + datetime.timedelta(minutes=tolerans)):
            continue
        anahtar = f"{t.get('ad')}|{baslangic.isoformat()}"
        if anahtar in durum:
            continue
        if katil(t, t.get("gorunen_ad", gorunen_ad)):
            durum[anahtar] = True

    # yalnız son 7 günün kayıtlarını tut
    sinir = (simdi - datetime.timedelta(days=7)).isoformat()
    durum = {k: v for k, v in durum.items() if k.split("|", 1)[1] >= sinir}
    DURUM.write_text(json.dumps(durum, ensure_ascii=False), encoding="utf-8")


if __name__ == "__main__":
    main()
