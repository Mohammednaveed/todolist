const taskInput = document.querySelector("#task-input"),
  prioritySelect = document.querySelector("#priority"),
  dueDateInput = document.querySelector("#due-date"),
  filters = document.querySelectorAll(".filters span"),
  clearAll = document.querySelector(".clear-btn"),
  exportBtn = document.querySelector(".export-btn"),
  taskBox = document.querySelector(".task-box");

let editId,
  isEditTask = false,
  todos = JSON.parse(localStorage.getItem("todo-list")) || [];

filters.forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelector("span.active").classList.remove("active");
    btn.classList.add("active");
    showTodo(btn.id);
  });
});

function showTodo(filter) {
  let li = "";
  if (todos) {
    todos.forEach((todo, id) => {
      let completed = todo.status === "completed" ? "checked" : "";
      if (filter === todo.status || filter === "all" || (filter === "high-priority" && todo.priority === "high")) {
        li += `<li class="task ${completed ? 'completed' : ''} ${todo.priority === 'low' ? 'priority-low' : todo.priority === 'medium' ? 'priority-medium' : 'priority-high'}">
                <label for="${id}">
                    <input onclick="updateStatus(this)" type="checkbox" id="${id}" ${completed}>
                    <p class="${completed}">${todo.name}</p>
                    <span>${todo.dueDate}</span>
                </label>
                <div class="settings">
                    <i onclick="showMenu(this)" class="uil uil-ellipsis-h"></i>
                    <ul class="task-menu">
                        <li onclick='editTask(${id}, "${todo.name}", "${todo.priority}", "${todo.dueDate}")'><i class="uil uil-pen"></i>Edit</li>
                        <li onclick='deleteTask(${id})'><i class="uil uil-trash"></i>Delete</li>
                    </ul>
                </div>
            </li>`;
      }
    });
  }
  taskBox.innerHTML = li || `<span>You don't have any task here</span>`;
  clearAll.classList.toggle("active", todos.length > 0);
}

showTodo("all");

function showMenu(selectedTask) {
  let menuDiv = selectedTask.parentElement.lastElementChild;
  menuDiv.classList.add("show");
  document.addEventListener("click", (e) => {
    if (e.target !== selectedTask) {
      menuDiv.classList.remove("show");
    }
  }, { once: true });
}

function updateStatus(selectedTask) {
  let taskName = selectedTask.parentElement.lastElementChild;
  if (selectedTask.checked) {
    taskName.classList.add("checked");
    todos[selectedTask.id].status = "completed";
  } else {
    taskName.classList.remove("checked");
    todos[selectedTask.id].status = "pending";
  }
  localStorage.setItem("todo-list", JSON.stringify(todos));
  showTodo(document.querySelector("span.active").id);
}

function editTask(taskId, taskName, priority, dueDate) {
  editId = taskId;
  isEditTask = true;
  taskInput.value = taskName;
  prioritySelect.value = priority;
  dueDateInput.value = dueDate;
  taskInput.focus();
  taskInput.classList.add("active");
}

function deleteTask(deleteId) {
  todos.splice(deleteId, 1);
  localStorage.setItem("todo-list", JSON.stringify(todos));
  showTodo(document.querySelector("span.active").id);
}

clearAll.addEventListener("click", () => {
  todos.splice(0, todos.length);
  localStorage.setItem("todo-list", JSON.stringify(todos));
  showTodo();
});

taskInput.addEventListener("keyup", (e) => {
  let userTask = taskInput.value.trim();
  let userPriority = prioritySelect.value;
  let userDueDate = dueDateInput.value;
  if (e.key === "Enter" && userTask) {
    if (!isEditTask) {
      let taskInfo = { name: userTask, priority: userPriority, dueDate: userDueDate, status: "pending" };
      todos.push(taskInfo);
    } else {
      isEditTask = false;
      todos[editId].name = userTask;
      todos[editId].priority = userPriority;
      todos[editId].dueDate = userDueDate;
    }
    taskInput.value = "";
    prioritySelect.value = "low";
    dueDateInput.value = "";
    localStorage.setItem("todo-list", JSON.stringify(todos));
    showTodo(document.querySelector("span.active").id);
  }
});

exportBtn.addEventListener("click", exportToExcel);

function exportToExcel() {
  const rows = [["Task", "Priority", "Due Date", "Status"]];
  if (todos) {
    todos.forEach((todo) => {
      rows.push([todo.name, todo.priority, todo.dueDate, todo.status]);
    });
  }
  let csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
  let encodedUri = encodeURI(csvContent);
  let link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "todo_list.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
