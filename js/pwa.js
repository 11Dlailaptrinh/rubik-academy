// Đăng ký service worker để app chạy offline khi được cài lên màn hình chính (iPhone / Android).
// Bỏ qua khi chạy trong Electron hoặc mở bằng file:// (service worker không hoạt động ở đó).
if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => { /* không sao: app vẫn chạy online */ });
  });
}
