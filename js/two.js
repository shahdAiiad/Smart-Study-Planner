document.addEventListener("DOMContentLoaded", () => {
    // 1. نظام القائمة الجانبية للموبايل لضمان عمل التوجيل بسلاسة
    const toggleBtn = document.querySelector('.toggle-btn');
    const sidebar = document.getElementById('sidebar');
    if (toggleBtn && sidebar) {
        toggleBtn.addEventListener('click', () => {
            sidebar.classList.toggle('show');   
            toggleBtn.classList.toggle('active'); 
        });
    }

    // 2. جلب البيانات الحقيقية المخزنة من الصفحات الأخرى (دقائق، مهام، وكورسات)
    const focusMinutes = parseInt(localStorage.getItem("smartStudyFocusMinutes")) || 0;
    const tasksList = JSON.parse(localStorage.getItem("smartStudyTasks")) || [];
    
    // سطر الحل: جلب قائمة الكورسات المخزنة من صفحة الكورسات
    const coursesList = JSON.parse(localStorage.getItem("smartStudyCourses")) || [];

    // 3. حساب إحصائيات المهام والكورسات ونسبة الإنجاز
    const totalTasks = tasksList.length;
    const completedTasks = tasksList.filter(t => t.done).length;
    const totalCourses = coursesList.length; // حساب عدد الكورسات الحقيقي
    
    let completionRate = 0;
    if (totalTasks > 0) {
        completionRate = Math.round((completedTasks / totalTasks) * 100);
    }

    // 4. عرض الأرقام الحقيقية في بطاقات الـ Dashboard
    
    // بطاقة المهام
    const tasksDisplay = document.getElementById("dash-completed-tasks");
    if (tasksDisplay) {
        tasksDisplay.textContent = `${completedTasks} / ${totalTasks}`;
    }

    // بطاقة الكورسات (تم التفعيل والربط بنجاح الآن!)
    const coursesDisplay = document.getElementById("dash-course-count");
    if (coursesDisplay) {
        coursesDisplay.textContent = totalCourses;
    }

    // بطاقة دقائق التركيز
    const minutesDisplay = document.getElementById("dash-focus-minutes");
    if (minutesDisplay) {
        minutesDisplay.textContent = `${focusMinutes} دقيقة`;
    }

    // بطاقة نسبة الإنجاز
    const rateDisplay = document.getElementById("dash-completion-rate");
    if (rateDisplay) {
        rateDisplay.textContent = `${completionRate}%`;
    }

    // 5. عرض قائمة سريعة بأول 3 مهام متبقية للدراسة اليوم
    const quickTasksContainer = document.getElementById("dash-quick-tasks");
    if (quickTasksContainer) {
        const pendingTasks = tasksList.filter(t => !t.done).slice(0, 3);
        
        if (pendingTasks.length === 0) {
            quickTasksContainer.innerHTML = "<p style='color: #888; font-size: 14px; text-align: center; margin-top: 15px;'>لا توجد مهام معلقة اليوم! 🎉</p>";
        } else {
            quickTasksContainer.innerHTML = pendingTasks.map(task => `
                <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px; background: #1b263b; border-radius: 8px; margin-bottom: 8px; border: 1px solid #2c3d52; direction: rtl;">
                    <span style="color: #fff; font-size: 14px; font-weight: 500;">${task.title}</span>
                    <span style="color: #0D6EFD; font-size: 12px; background: #0d1b2e; padding: 4px 8px; border-radius: 15px;"><i class="fas fa-clock"></i> مستمرة</span>
                </div>
            `).join('');
        }
    }
});