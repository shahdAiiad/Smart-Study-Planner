// lang.js — يبدل لغة الموقع بين الإنجليزية والعربية

document.addEventListener('DOMContentLoaded', function () {
  const toggleBtn = document.getElementById('lang-toggle');
  const langText = document.getElementById('lang-text');
  let currentLang = localStorage.getItem('siteLang') || 'en';

  function applyLang(lang) {
    // تبديل كل العناصر اللي عندها data-en / data-ar (نص فقط)
    document.querySelectorAll('[data-en]').forEach(function (el) {
      el.textContent = el.getAttribute('data-' + lang);
    });

    // تبديل العناصر اللي محتواها فيه HTML (مثل span داخل h1)
    document.querySelectorAll('[data-en-html]').forEach(function (el) {
      el.innerHTML = el.getAttribute('data-' + lang + '-html');
    });

    // تغيير اتجاه الصفحة
    if (lang === 'ar') {
      document.documentElement.setAttribute('dir', 'rtl');
      document.documentElement.setAttribute('lang', 'ar');
      langText.textContent = 'English';
    } else {
      document.documentElement.setAttribute('dir', 'ltr');
      document.documentElement.setAttribute('lang', 'en');
      langText.textContent = 'العربية';
    }

    localStorage.setItem('siteLang', lang);
    currentLang = lang;
  }

  // تطبيق اللغة المحفوظة عند فتح الصفحة
  applyLang(currentLang);

  // عند الضغط على الزر
  toggleBtn.addEventListener('click', function (e) {
    e.preventDefault();
    const newLang = currentLang === 'en' ? 'ar' : 'en';
    applyLang(newLang);
  });
});
