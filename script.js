let tasksData = {};

const todo = document.querySelector("#todo");
const progress = document.querySelector("#progress");
const done = document.querySelector("#done");
const columns = [todo, progress, done];
let dragItem = null;

// ─── Helpers ────────────────────────────────────────────────

function updateCounts() {
    columns.forEach(col => {
        const tasks = col.querySelectorAll(".task");
        const count = col.querySelector(".count-badge");
        count.innerText = tasks.length;
    });
}

function saveToLocalStorage() {
    columns.forEach(col => {
        const tasks = col.querySelectorAll(".task");
        tasksData[col.id] = Array.from(tasks).map(t => ({
            title: t.querySelector("h2").innerText,
            desc: t.querySelector("p").innerText,
            priority: t.dataset.priority || "medium"
        }));
    });
    localStorage.setItem("tasks", JSON.stringify(tasksData));
}

function addDeleteEvent(task) {
    task.querySelector(".delete-btn").addEventListener("click", () => {
        task.style.animation = "none";
        task.style.transition = "all 0.2s ease";
        task.style.opacity = "0";
        task.style.transform = "scale(0.95)";
        setTimeout(() => {
            task.remove();
            updateCounts();
            saveToLocalStorage();
        }, 200);
    });
}

function createTaskElement(taskTitle, taskDesc, priority = "medium") {
    const div = document.createElement("div");
    div.classList.add("task");
    div.setAttribute("draggable", "true");
    div.dataset.priority = priority;
    div.innerHTML = `
        <h2>${taskTitle}</h2>
        <p>${taskDesc}</p>
        <div class="task-footer">
            <span class="priority-tag ${priority}">${priority}</span>
            <button class="delete-btn">Delete</button>
        </div>
    `;
    div.addEventListener("drag", () => {
        dragItem = div;
    });
    addDeleteEvent(div);
    return div;
}

// ─── Load from localStorage ──────────────────────────────────

if (localStorage.getItem("tasks")) {
    const data = JSON.parse(localStorage.getItem("tasks"));
    for (const col in data) {
        const column = document.querySelector(`#${col}`);
        const wrapper = column.querySelector(".tasks-wrapper");
        data[col].forEach(task => {
            const div = createTaskElement(task.title, task.desc, task.priority);
            wrapper.appendChild(div);
        });
    }
    updateCounts();
}

// ─── Drag & Drop ─────────────────────────────────────────────

function addDragEventsOnColumn(column) {
    const wrapper = column.querySelector(".tasks-wrapper");

    column.addEventListener("dragenter", (e) => {
        e.preventDefault();
        column.classList.add("hover-over");
    });
    column.addEventListener("dragleave", (e) => {
        if (!column.contains(e.relatedTarget)) {
            column.classList.remove("hover-over");
        }
    });
    column.addEventListener("dragover", (e) => {
        e.preventDefault();
    });
    column.addEventListener("drop", (e) => {
        e.preventDefault();
        if (dragItem) {
            wrapper.appendChild(dragItem);
        }
        column.classList.remove("hover-over");
        updateCounts();
        saveToLocalStorage();
    });
}

addDragEventsOnColumn(todo);
addDragEventsOnColumn(progress);
addDragEventsOnColumn(done);

// ─── Modal ───────────────────────────────────────────────────

const toggleModalButton = document.querySelector("#toggle-modal");
const closeModalButton = document.querySelector("#close-modal");
const modalBg = document.querySelector(".modal .bg");
const modal = document.querySelector(".modal");
const addTaskButton = document.querySelector("#add-new-task");
const titleInput = document.querySelector("#task-title-input");
const descInput = document.querySelector("#task-desc-input");
const priorityInput = document.querySelector("#task-priority");

function openModal() {
    modal.classList.add("active");
    titleInput.focus();
}

function closeModal() {
    modal.classList.remove("active");
    titleInput.value = "";
    descInput.value = "";
    priorityInput.value = "medium";
}

toggleModalButton.addEventListener("click", openModal);
closeModalButton.addEventListener("click", closeModal);
modalBg.addEventListener("click", closeModal);

// Close on Escape key
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
});

addTaskButton.addEventListener("click", () => {
    const taskTitle = titleInput.value.trim();
    const taskDesc = descInput.value.trim();
    const priority = priorityInput.value;

    if (!taskTitle) {
        titleInput.style.borderColor = "var(--danger)";
        setTimeout(() => titleInput.style.borderColor = "", 1000);
        return;
    }

    const wrapper = todo.querySelector(".tasks-wrapper");
    const div = createTaskElement(taskTitle, taskDesc || "No description.", priority);
    wrapper.appendChild(div);
    updateCounts();
    saveToLocalStorage();
    closeModal();
});

// Submit with Enter key in title field
titleInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") addTaskButton.click();
});