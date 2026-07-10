const toggleBtn = document.querySelector('.toggle-btn');
const sidebar = document.getElementById('sidebar');

if (toggleBtn && sidebar) {
    toggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('show');   
        toggleBtn.classList.toggle('active'); 
    });
}

document.addEventListener("DOMContentLoaded", () => {
    const timerDisplay = document.getElementById("timer-display");
    const btnStart = document.getElementById("btn-start");
    const btnPause = document.getElementById("btn-pause");
    const btnReset = document.getElementById("btn-reset");
    const btnWork = document.getElementById("btn-work");
    const btnBreak = document.getElementById("btn-break");
    const taskSelect = document.getElementById("focus-task-select");
    
    const inputWorkTime = document.getElementById("input-work-time");
    const inputBreakTime = document.getElementById("input-break-time");
    const btnApplySettings = document.getElementById("btn-apply-settings");

    const rainCheck = document.getElementById("ambient-rain");
    const cafeCheck = document.getElementById("ambient-cafe");
    const audioRain = document.getElementById("audio-rain");
    const audioCafe = document.getElementById("audio-cafe");
    const audioBell = document.getElementById("audio-bell");

    let timerId = null;
    let customWorkMinutes = 25;
    let customBreakMinutes = 5;
    let timeLeft = customWorkMinutes * 60; 
    let isWorkMode = true;

    const tasksList = JSON.parse(localStorage.getItem("smartStudyTasks")) || [];
    const activeTasks = tasksList.filter(t => !t.done);
    activeTasks.forEach(task => {
        const opt = document.createElement("option");
        opt.value = task.title;
        opt.textContent = `${task.title} (${task.course})`;
        taskSelect.appendChild(opt);
    });

    function updateDisplay() {
        const mins = Math.floor(timeLeft / 60).toString().padStart(2, '0');
        const secs = (timeLeft % 60).toString().padStart(2, '0');
        timerDisplay.textContent = `${mins}:${secs}`;
    }

    function startTimer() {
        if (timerId !== null) return;
        
        btnStart.style.display = "none";
        btnPause.style.display = "block";

        timerId = setInterval(() => {
            timeLeft--;
            updateDisplay();

            if (timeLeft <= 0) {
                clearInterval(timerId);
                timerId = null;
                audioBell.play().catch(() => {});
                
                if (isWorkMode) {
                    let focusMinutes = parseInt(localStorage.getItem("smartStudyFocusMinutes")) || 0;
                    focusMinutes += customWorkMinutes;
                    localStorage.setItem("smartStudyFocusMinutes", focusMinutes);
                    alert(`عمل رائع ومميز! لقد أنهيتِ ${customWorkMinutes} دقيقة من التركيز الكامل وتمت إضافتها لإنجازاتكِ. خذي قسطاً من الراحة الآن.`);
                    switchMode(false);
                } else {
                    alert("انتهى وقت الراحة! هل أنتِ جاهزة لجلسة تركيز جديدة؟");
                    switchMode(true);
                }
            }
        }, 1000);
    }

    function pauseTimer() {
        clearInterval(timerId);
        timerId = null;
        btnPause.style.display = "none";
        btnStart.style.display = "block";
    }

    function resetTimer() {
        pauseTimer();
        timeLeft = isWorkMode ? customWorkMinutes * 60 : customBreakMinutes * 60;
        updateDisplay();
    }

    function switchMode(work) {
        isWorkMode = work;
        pauseTimer();
        if (isWorkMode) {
            timeLeft = customWorkMinutes * 60;
            btnWork.style.background = "#0D6EFD";
            btnWork.style.color = "white";
            btnBreak.style.background = "#0d1b2e";
            btnBreak.style.color = "#ccc";
        } else {
            timeLeft = customBreakMinutes * 60;
            btnBreak.style.background = "#2a9d8f";
            btnBreak.style.color = "white";
            btnWork.style.background = "#0d1b2e";
            btnWork.style.color = "#ccc";
        }
        updateDisplay();
    }

    btnApplySettings.addEventListener("click", () => {
        const wMin = parseInt(inputWorkTime.value);
        const bMin = parseInt(inputBreakTime.value);

        if (wMin > 0 && bMin > 0) {
            customWorkMinutes = wMin;
            customBreakMinutes = bMin;
            resetTimer();
            alert(`تم تحديث التوقيت بنجاح! جلسة الدراسة: ${customWorkMinutes} دقيقة، جلسة الراحة: ${customBreakMinutes} دقيقة.`);
        } else {
            alert("يرجى إدخال قيم صحيحة أكبر من صفر.");
        }
    });

    btnStart.addEventListener("click", startTimer);
    btnPause.addEventListener("click", pauseTimer);
    btnReset.addEventListener("click", resetTimer);
    btnWork.addEventListener("click", () => switchMode(true));
    btnBreak.addEventListener("click", () => switchMode(false));

    rainCheck.addEventListener("change", () => {
        if (rainCheck.checked) {
            audioRain.play().catch(() => {});
        } else {
            audioRain.pause();
        }
    });

    cafeCheck.addEventListener("change", () => {
        if (cafeCheck.checked) {
            audioCafe.play().catch(() => {});
        } else {
            audioCafe.pause();
        }
    });
});