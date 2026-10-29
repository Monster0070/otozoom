#!/bin/zsh
# Betiği launchd'ye ekler: Mac açıkken her dakika kontrol eder.
set -e
KLASOR="$(cd "$(dirname "$0")" && pwd)"
PLIST="$HOME/Library/LaunchAgents/com.enes.zoom-otomatik.plist"

cat > "$PLIST" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key><string>com.enes.zoom-otomatik</string>
  <key>ProgramArguments</key>
  <array>
    <string>/usr/bin/python3</string>
    <string>$KLASOR/zoom_katil.py</string>
  </array>
  <key>StartInterval</key><integer>60</integer>
  <key>RunAtLoad</key><true/>
  <key>StandardErrorPath</key><string>$KLASOR/hata.log</string>
</dict>
</plist>
EOF

launchctl bootout "gui/$(id -u)/com.enes.zoom-otomatik" 2>/dev/null || true
launchctl bootstrap "gui/$(id -u)" "$PLIST"
echo "Kuruldu. Kaldırmak için: launchctl bootout gui/$(id -u)/com.enes.zoom-otomatik && rm \"$PLIST\""

