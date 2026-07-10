const translations = {
    en: {
        welcome: "Welcome back",
        subtitle: "Sign in to continue studying smarter.",
        google: "Continue with Google",
        or: "OR",
        email: "Email",
        password: "Password",
        signin: "Sign in",
        newHere: "New here?",
        createAccount: "Create an account",

        signupTitle: "Create your account",
        signupSub: "Start studying smarter today.",
        fullname: "Full Name",
        signup: "Sign up",
        already: "Already have an account?",
        login: "Sign in"
    },

    ar: {
        welcome: "مرحبًا بعودتك",
        subtitle: "سجل الدخول لمتابعة الدراسة بذكاء.",
        google: "المتابعة باستخدام Google",
        or: "أو",
        email: "البريد الإلكتروني",
        password: "كلمة المرور",
        signin: "تسجيل الدخول",
        newHere: "مستخدم جديد؟",
        createAccount: "إنشاء حساب",

        signupTitle: "إنشاء حساب",
        signupSub: "ابدأ الدراسة بذكاء من اليوم.",
        fullname: "الاسم الكامل",
        signup: "إنشاء حساب",
        already: "لديك حساب؟",
        login: "تسجيل الدخول"
    }
};

function setLanguage(lang) {

    localStorage.setItem("lang", lang);

    document.documentElement.lang = lang;
    document.documentElement.dir = (lang === "ar") ? "rtl" : "ltr";

    document.querySelectorAll("[data-lang]").forEach(el => {

        const key = el.dataset.lang;

        if (translations[lang][key]) {

            if (el.tagName === "INPUT") {
                el.placeholder = translations[lang][key];
            } else {
                el.textContent = translations[lang][key];
            }

        }

    });

    const btn = document.getElementById("langBtn");

    if (btn) {
        btn.textContent = (lang === "en") ? "🌐 العربية" : "🌐 English";
    }
}

window.addEventListener("DOMContentLoaded", () => {

    const btn = document.getElementById("langBtn");

    if (!btn) return;

    const lang = localStorage.getItem("lang") || "en";

    setLanguage(lang);

    btn.onclick = () => {

        const current = localStorage.getItem("lang") || "en";

        setLanguage(current === "en" ? "ar" : "en");

    };

});