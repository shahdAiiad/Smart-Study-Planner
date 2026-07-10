const toggleBtn = document.querySelector('.toggle-btn');
const sidebar = document.getElementById('sidebar');

if (toggleBtn && sidebar) {
    toggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('show');   
        toggleBtn.classList.toggle('active'); 
        if (toggleBtn.classList.contains('active')) {
            toggleBtn.style.backgroundColor = "rgba(255,255,255,0.15)";
            toggleBtn.style.borderRadius = "8px";
        } else {
            toggleBtn.style.backgroundColor = "transparent";
            toggleBtn.style.borderRadius = "0";
        }
    });
}

// 2. إدارة المساقات عند تحميل الصفحة
document.addEventListener("DOMContentLoaded", () => {
    const courseForm = document.getElementById("course-form");
    const coursesContainer = document.getElementById("courses-container");
    const noCoursesMsg = document.getElementById("no-courses-msg");

    // جلب البيانات من الـ localStorage المشترك
    let coursesList = JSON.parse(localStorage.getItem("smartStudyCourses")) || [];
    
    // عرض الكورسات فوراً لو كانت مخزنة مسبقاً
    renderCourses();

    // الاستماع لنموذج الإضافة
    if (courseForm) {
        courseForm.addEventListener("submit", (e) => {
            e.preventDefault();

            const name = document.getElementById("course-name").value.trim();
            const code = document.getElementById("course-code").value.trim();
            const instructor = document.getElementById("course-instructor").value.trim();
            const credits = document.getElementById("course-credits").value;

            // بناء كائن المساق حسب التحليل
            const newCourse = {
                id: Date.now(),
                name: name,
                code: code,
                instructor: instructor,
                credits: credits
            };

            // الحفظ في المصفوفة والـ localStorage
            coursesList.push(newCourse);
            localStorage.setItem("smartStudyCourses", JSON.stringify(coursesList));

            // إعادة تعيين الحقول وتحديث الواجهة
            courseForm.reset();
            renderCourses();
        });
    }

    // دالة بناء وعرض بطاقات الكورسات
    function renderCourses() {
        if (!coursesContainer) return;
        
        // تفريغ الحاوية مع الحفاظ على رسالة "لا توجد مساقات" في الـ HTML
        coursesContainer.innerHTML = '';

        if (coursesList.length === 0) {
            if (noCoursesMsg) {
                noCoursesMsg.style.display = "block";
                coursesContainer.appendChild(noCoursesMsg);
            }
        } else {
            if (noCoursesMsg) noCoursesMsg.style.display = "none";
        }

        // إنشاء كارد لكل مساق
        coursesList.forEach(course => {
            const card = document.createElement("div");
            card.className = "box";
            card.style.cssText = "padding:20px; background:#1b263b; border-radius:12px; border:1px solid #2c3d52; direction: rtl; position: relative;";

            card.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                    <span style="font-size:11px; background:#0D6EFD; color:#fff; padding:4px 10px; border-radius:20px; font-weight:bold;">
                        ${course.code.toUpperCase()}
                    </span>
                    <button onclick="deleteCourse(${course.id})" style="background:none; border:none; color:#ff4d4d; cursor:pointer; font-size:15px;">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
                <h4 style="margin: 5px 0 12px; font-size:17px; font-weight: 600; color: #fff; text-align: right;">${course.name}</h4>
                
                <div style="border-top: 1px solid #2c3d52; padding-top: 10px; font-size:13px; color:#b0c4de; display: flex; flex-direction:column; gap: 8px;">
                    <div style="display:flex; align-items:center; gap:6px;">
                        <i class="fas fa-user-tie" style="color: #0D6EFD; width:16px;"></i> 
                        <span>المحاضر: <strong>${course.instructor}</strong></span>
                    </div>
                    <div style="display:flex; align-items:center; gap:6px;">
                        <i class="fas fa-graduation-cap" style="color: #0D6EFD; width:16px;"></i> 
                        <span>عدد الساعات: <strong>${course.credits}</strong></span>
                    </div>
                </div>
            `;
            coursesContainer.appendChild(card);
        });
    }

    // دالة الحذف
    window.deleteCourse = function(id) {
        if (confirm("هل أنت متأكد من حذف هذا المساق؟")) {
            coursesList = coursesList.filter(c => c.id !== id);
            localStorage.setItem("smartStudyCourses", JSON.stringify(coursesList));
            renderCourses();
        }
    };
});