// Panel başka bir sayfanın içine gömülmüşse, yuzen.js anahtarı doğrulayana kadar görünmez kalır.
if (window.top !== window) document.documentElement.style.visibility = "hidden";
