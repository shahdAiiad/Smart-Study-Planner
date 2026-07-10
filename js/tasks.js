const toggleBtn = document.querySelector('.toggle-btn');
const sidebar = document.getElementById('sidebar');

if (toggleBtn && sidebar) {
    toggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('show');   
        toggleBtn.classList.toggle('active'); 
    });
}

document.addEventListener("DOMContentLoaded", () => {
    const taskForm = document.getElementById("task-form");
    const taskCourseSelect = document.getElementById("task-course");
    const tasksContainer = document.getElementById("tasks-container");
    const noTasksMsg = document.getElementById("no-tasks-msg");

    let coursesList = JSON.parse(localStorage.getItem("smartStudyCourses")) || [];
    let tasksList = JSON.parse(localStorage.getItem("smartStudyTasks")) || [];

    if (taskCourseSelect) {
        coursesList.forEach(course => {
            const option = document.createElement("option");
            option.value = course.name; 
            option.textContent = `${course.name} (${course.code.toUpperCase()})`;
            taskCourseSelect.appendChild(option);
        });
    }

    renderTasks();

    if (taskForm) {
        taskForm.addEventListener("submit", (e) => {
            e.preventDefault();

            const title = document.getElementById("task-title").value.trim();
            const courseName = taskCourseSelect.value;
            const date = document.getElementById("task-date").value;
            const type = document.getElementById("task-type").value;

            const newTask = {
                id: Date.now(),
                title: title,
                course: courseName,
                date: date,
                type: type,
                done: false 
            };

            tasksList.push(newTask);
            localStorage.setItem("smartStudyTasks", JSON.stringify(tasksList));

            taskForm.reset();
            renderTasks();
        });
    }

    function renderTasks() {
        if (!tasksContainer) return;
        
        tasksContainer.innerHTML = '';

        if (tasksList.length === 0) {
            if (noTasksMsg) {
                noTasksMsg.style.display = "block";
                tasksContainer.appendChild(noTasksMsg);
            }
        } else {
            if (noTasksMsg) noTasksMsg.style.display = "none";
        }

        tasksList.forEach(task => {
            const card = document.createElement("div");
            card.className = "box";
            const opacityStyle = task.done ? "opacity: 0.5; background: #131b26;" : "";
            card.style.cssText = `padding:20px; background:#1b263b; border-radius:12px; border:1px solid #2c3d52; direction: rtl; position: relative; ${opacityStyle}`;

            let typeIcon = "fa-clipboard-list";
            if (task.type === "Project") typeIcon = "fa-project-diagram";
            if (task.type === "Quiz/Exam") typeIcon = "fa-file-alt";

            const dateObj = new Date(task.date);
            const day = dateObj.getDate() || "--";
            const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
            const month = isNaN(dateObj.getMonth()) ? "DATE" : months[dateObj.getMonth()];

            card.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px;">
                    <span style="font-size:11px; background:#e0a800; color:#000; padding:4px 10px; border-radius:20px; font-weight:bold;">
                        <i class="fas ${typeIcon}"></i> ${task.type}
                    </span>
                    <button onclick="deleteTask(${task.id})" style="background:none; border:none; color:#ff4d4d; cursor:pointer; font-size:15px;">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
                
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                    <div>
                        <h4 style="margin: 0 0 5px 0; font-size:17px; font-weight: 600; color: #fff; text-align: right; text-decoration: ${task.done ? 'line-through' : 'none'};">${task.title}</h4>
                        <p style="font-size:13px; color:#0D6EFD; margin: 0; font-weight:bold;"><i class="fas fa-book-open"></i> ${task.course}</p>
                    </div>
                    
                    <div style="width: 50px; background: #0d1b2e; border-radius: 8px; overflow: hidden; border: 1px solid #ff4d4d; text-align: center; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                        <div style="background: #ff4d4d; color: white; font-size: 10px; font-weight: bold; padding: 2px 0; letter-spacing: 0.5px;">${month}</div>
                        <div style="color: white; font-size: 18px; font-weight: bold; padding: 5px 0; line-height: 1;">${day}</div>
                    </div>
                </div>
                
                <div style="border-top: 1px solid #2c3d52; padding-top: 12px; font-size:13px; color:#b0c4de; display: flex; justify-content: flex-end; align-items: center;">
                    <label style="display:flex; align-items:center; gap:5px; cursor:pointer; color:#fff; font-size:12px;">
                        <input type="checkbox" ${task.done ? 'checked' : ''} onchange="toggleTaskDone(${task.id})" style="cursor:pointer; width:15px; height:15px;"> تم الإنجاز
                    </label>
                </div>
            `;
            tasksContainer.appendChild(card);
        });
    }

    window.toggleTaskDone = function(id) {
        tasksList = tasksList.map(task => {
            if (task.id === id) {
                task.done = !task.done;
            }
            return task;
        });
        localStorage.setItem("smartStudyTasks", JSON.stringify(tasksList));
        renderTasks();
    };

    window.deleteTask = function(id) {
        if (confirm("هل أنت متأكد من حذف هذه المهمة؟")) {
            tasksList = tasksList.filter(t => t.id !== id);
            localStorage.setItem("smartStudyTasks", JSON.stringify(tasksList));
            renderTasks();
        }
    };
});