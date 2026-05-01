async function signup() {
    await fetch('/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: document.getElementById('name').value,
            email: document.getElementById('email2').value,
            password: document.getElementById('password2').value,
            role: document.getElementById('role').value
        })
    });
    alert("User created");
}

async function login() {
    let res = await fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: document.getElementById('email').value,
            password: document.getElementById('password').value
        })
    });

    let data = await res.json();

    if (data.user_id) {
        localStorage.setItem("user_id", data.user_id);
        localStorage.setItem("role", data.role);
        window.location.href = "/dashboard";
    } else {
        alert("Login failed");
    }
}

async function createProject() {
    let user_id = localStorage.getItem("user_id");

    await fetch('/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: document.getElementById('project_name').value,
            user_id: user_id
        })
    });

    alert("Project Created");
}

async function createTask() {
    await fetch('/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            title: document.getElementById('task_title').value,
            //assigned_to: document.getElementById('assigned_to').value,
            assigned_to: localStorage.getItem("user_id"),
            project_id: document.getElementById('project_id').value,
            deadline: document.getElementById('deadline').value
        })
    });

    alert("Task Created");
    loadTasks();
}
async function loadTasks() {
    let res = await fetch('/tasks');
    let data = await res.json();

    let list = document.getElementById('task_list');
    list.innerHTML = "";

    let today = new Date().toISOString().split('T')[0];

    data.forEach(task => {
        let li = document.createElement('li');

        let overdue = task.deadline && task.deadline < today ? " (Overdue)" : "";

        li.innerHTML = `
            ${task.title} - ${task.status} ${overdue}
            <button onclick="updateTask(${task.id}, 'Done')">Mark Done</button>
        `;

        list.appendChild(li);
    });
}
// async function loadTasks() {
//     let res = await fetch('/tasks');
//     let data = await res.json();

//     let list = document.getElementById('task_list');
//     list.innerHTML = "";

//     data.forEach(task => {
//         let li = document.createElement('li');

//         li.innerHTML = `
//             ${task.title} - ${task.status}
            
//             <button onclick="updateTask(${task.id}, 'Done')">Mark Done</button>
//         `;

//         list.appendChild(li);
//     });
// }

async function updateTask(id, status) {
    await fetch(`/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
    });

    loadTasks();
}

// Auto load tasks on dashboard
if (window.location.pathname === "/dashboard") {
    loadTasks();
}