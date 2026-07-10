const toggleBtn = document.querySelector('.toggle-btn');
const sidebar = document.getElementById('sidebar');

if (toggleBtn && sidebar) {
    toggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('show');   
        toggleBtn.classList.toggle('active'); 
    });
}

document.addEventListener("DOMContentLoaded", () => {
    const plannerForm = document.getElementById("planner-form");
    const aiLoading = document.getElementById("ai-loading");
    const plannerOutput = document.getElementById("planner-output");

    if (plannerForm) {
        plannerForm.addEventListener("submit", (e) => {
            e.preventDefault();

            const hours = document.getElementById("study-hours").value;
            const priority = document.getElementById("plan-priority").value;

            const coursesList = JSON.parse(localStorage.getItem("smartStudyCourses")) || [];
            const tasksList = JSON.parse(localStorage.getItem("smartStudyTasks")) || [];

            plannerOutput.style.display = "none";
            aiLoading.style.display = "block";

            setTimeout(() => {
                aiLoading.style.display = "none";
                plannerOutput.style.display = "grid";
                generatePlanHTML(coursesList, tasksList, hours, priority);
            }, 1200);
        });
    }

    function generatePlanHTML(courses, tasks, hours, priority) {
        plannerOutput.innerHTML = "";

        if (tasks.length === 0) {
            plannerOutput.innerHTML = `
                <div class="box" style="padding: 40px; text-align: center; background: #1b263b; border-radius: 12px; border: 1px solid #2c3d52;">
                    <i class="fas fa-info-circle" style="font-size: 30px; color: #e0a800; margin-bottom: 15px;"></i>
                    <p style="color: #ccc; margin: 0; font-size: 15px;">لم يجد المحرك الذكي أي مهام أو واجبات مجدولة حالياً. يرجى إضافة مهام في صفحة المهام أولاً ليتمكن الذكاء الاصطناعي من بناء خطتك الدراسية!</p>
                </div>
            `;
            return;
        }

        const activeTasks = tasks.filter(t => !t.done);
        
        let sortedTasks = [...activeTasks];
        if (priority === "urgent") {
            sortedTasks.sort((a, b) => new Date(a.date) - new Date(b.date));
        }

        let planSummaryHTML = `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 10px;">
                <div class="box" style="padding:15px; background:#1b263b; border-radius:10px; border:1px solid #2c3d52; text-align:center;">
                    <p style="margin:0 0 5px 0; font-size:12px; color:#b0c4de;">المهام النشطة الخاضعة للتحليل</p>
                    <h3 style="margin:0; font-size:22px; color:#0D6EFD;">${activeTasks.length} مهام</h3>
                </div>
                <div class="box" style="padding:15px; background:#1b263b; border-radius:10px; border:1px solid #2c3d52; text-align:center;">
                    <p style="margin:0 0 5px 0; font-size:12px; color:#b0c4de;">توزيع المذاكرة اليومي المقترح</p>
                    <h3 style="margin:0; font-size:22px; color:#2a9d8f;">${hours} ساعات / يوم</h3>
                </div>
                <div class="box" style="padding:15px; background:#1b263b; border-radius:10px; border:1px solid #2c3d52; text-align:center;">
                    <p style="margin:0 0 5px 0; font-size:12px; color:#b0c4de;">نمط دمج فترات الراحة</p>
                    <h3 style="margin:0; font-size:22px; color:#e0a800;">بومودورو ذكي</h3>
                </div>
            </div>
            <h3 style="color:#fff; font-size:16px; margin: 20px 0 10px 0; text-align:right; direction:rtl;"><i class="fas fa-stream" style="color:#0D6EFD;"></i> الخطوات الزمنية المقترحة لخطة المذاكرة:</h3>
        `;

        let timelineHTML = `<div style="display: flex; flex-direction: column; gap: 15px; direction: rtl;">`;

        sortedTasks.forEach((task, index) => {
            let recommendation = "";
            let timeNeeded = "";
            
            if (task.type === "Assignment") {
                recommendation = `مراجعة سريعة لمحاضرة مساق (${task.course}) ثم البدء بحل الواجب مباشرة باستخدام أسلوب التركيز لمدة 45 دقيقة يليها 5 دقائق راحة.`;
                timeNeeded = "ساعة ونصف";
            } else if (task.type === "Project") {
                recommendation = `تقسيم مشروع مساق (${task.course}) إلى أجزاء صغيرة. ابدأ اليوم بتهيئة ملف التصميم والهيكل الأساسي وتجنب العمل المتواصل.`;
                timeNeeded = "ساعتان";
            } else {
                recommendation = `مراجعة الشاشات وحل نماذج اختبارات سابقة لمساق (${task.course})، ركز على النقاط النظرية في أول نصف ساعة ثم العملي.`;
                timeNeeded = "3 ساعات مقسمة";
            }

            timelineHTML += `
                <div class="box" style="padding: 20px; background: #1b263b; border-radius: 12px; border: 1px solid #2c3d52; border-right: 5px solid #0D6EFD; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px;">
                    <div style="flex: 1; min-width: 250px;">
                        <div style="display:flex; align-items:center; gap:10px; margin-bottom:8px;">
                            <span style="font-size:11px; background:#0d1b2e; color:#0D6EFD; padding:3px 8px; border-radius:5px; font-weight:bold; border: 1px solid #0D6EFD;">الخطوة ${index + 1}</span>
                            <h4 style="margin:0; font-size:16px; color:#fff;">التحضير لـ: ${task.title}</h4>
                        </div>
                        <p style="margin:0; font-size:13px; color:#b0c4de; line-height: 1.6;">${recommendation}</p>
                    </div>
                    <div style="text-align: left; min-width: 120px;">
                        <div style="font-size:12px; color:#ff4d4d; margin-bottom:5px;"><i class="fas fa-clock"></i> الوقت المقدر: ${timeNeeded}</div>
                        <div style="font-size:11px; color:#ccc;">تاريخ التسليم: ${task.date}</div>
                    </div>
                </div>
            `;
        });

        timelineHTML += `</div>`;

        plannerOutput.innerHTML = planSummaryHTML + timelineHTML;
    }
});