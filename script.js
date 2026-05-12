class TodoApp {
    constructor() {
        this.currentUser = null;
        this.tasks = [];
        this.filter = 'all';
        this.init();
    }

    init() {
        this.loadTheme();
        this.checkAuth();
        this.bindEvents();
    }

   loadTheme() {
    const savedTheme = localStorage.getItem('app-theme');
    if (savedTheme) {
        this.setTheme(savedTheme);
    } else {
        // По умолчанию — светлая тема
        this.setTheme('light');
    }
}



    setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);

    // Обновляем переключатель темы
    this.updateThemeSwitch(theme);

    // Добавляем класс для анимации фона
    document.body.classList.remove('theme-light', 'theme-dark');
    document.body.classList.add(`theme-${theme}`);

    localStorage.setItem('app-theme', theme);
}


    updateThemeSwitch(theme) {
    const themeSwitch = document.getElementById('themeSwitch');
    if (themeSwitch) {
        themeSwitch.checked = theme === 'dark';
    }
}

    toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    this.setTheme(newTheme);
}


    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
    }

    checkAuth() {
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            this.currentUser = savedUser;
            this.showTodoApp();
            this.loadTasks();
        } else {
            this.showAuthScreen();
        }
    }

    showAuthScreen() {
        document.getElementById('authSection').style.display = 'block';
        document.getElementById('todoApp').style.display = 'none';
    }

    showTodoApp() {
        document.getElementById('authSection').style.display = 'none';
        document.getElementById('todoApp').style.display = 'block';
        document.getElementById('currentUser').textContent = `Пользователь: ${this.currentUser}`;
    }

    login() {
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();

        if (!username || !password) {
            alert('Пожалуйста, заполните все поля');
            return;
        }

        const savedPassword = localStorage.getItem(`password_${username}`);

        if (savedPassword && savedPassword !== password) {
            alert('Неверный пароль');
            return;
        }

        if (!savedPassword) {
            localStorage.setItem(`password_${username}`, password);
            alert(`Аккаунт создан для пользователя ${username}`);
        }

        this.currentUser = username;
        localStorage.setItem('currentUser', username);
        this.showTodoApp();
        this.loadTasks();
        document.getElementById('currentUser').textContent = `Пользователь: ${username}`;
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
        this.showAuthScreen();
        document.getElementById('username').value = '';
        document.getElementById('password').value = '';
    }

    loadTasks() {
        const tasksJSON = localStorage.getItem(`tasks_${this.currentUser}`);
        if (tasksJSON) {
            this.tasks = JSON.parse(tasksJSON);
        } else {
            this.tasks = [];
        }
        this.renderTasks();
        this.updateStats();
    }

    saveTasks() {
        localStorage.setItem(`tasks_${this.currentUser}`, JSON.stringify(this.tasks));
    }

    bindEvents() {
        const themeSwitch = document.getElementById('themeSwitch');

        if (themeSwitch) {
        themeSwitch.addEventListener('change', () => this.toggleTheme());
        }
        // Обработчики для экрана авторизации
        const loginBtn = document.getElementById('loginBtn');
        const logoutBtn = document.getElementById('logoutBtn');
        const themeToggle = document.getElementById('themeToggle');

        if (loginBtn) {
            loginBtn.addEventListener('click', () => this.login());
        }

        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }

        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }

        // Обработчики для основного приложения
        const addTaskBtn = document.getElementById('addTaskBtn');
        const taskInput = document.getElementById('taskInput');
        const clearCompletedBtn = document.getElementById('clearCompletedBtn');

        if (addTaskBtn) {
            addTaskBtn.addEventListener('click', () => this.addTask());
        }

        if (taskInput) {
            taskInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.addTask();
            });
        }

        if (clearCompletedBtn) {
            clearCompletedBtn.addEventListener('click', () => this.clearCompletedTasks());
        }

        // Фильтры
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.setFilter(e.target.dataset.filter));
        });
    }

    addTask() {
        const input = document.getElementById('taskInput');
        const text = input.value.trim();

        if (text) {
            const newTask = {
                id: Date.now(),
                text: text,
                completed: false
            };

            this.tasks.unshift(newTask);
            this.saveTasks();
            this.renderTasks();
            this.updateStats();
            input.value = '';
        }
    }

    toggleTask(id) {
        this.tasks = this.tasks.map(task =>
            task.id === id ? { ...task, completed: !task.completed } : task
        );
        this.saveTasks();
        this.renderTasks();
        this.updateStats();
    }

    editTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (!task) return;

        const newText = prompt('Редактировать задачу:', task.text);
        if (newText !== null && newText.trim() !== '') {
            this.tasks = this.tasks.map(t =>
                t.id === id ? { ...t, text: newText.trim() } : t
            );
            this.saveTasks();
            this.renderTasks();
        }
    }

    deleteTask(id) {
        const taskElement = document.querySelector(`[data-id="${id}"]`);
        taskElement.classList.add('removed');

        setTimeout(() => {
            this.tasks = this.tasks.filter(task => task.id !== id);
            this.saveTasks();
            this.renderTasks();
            this.updateStats();
        }, 300);
    }

    clearCompletedTasks() {
        const completedTasks = this.tasks.filter(task => task.completed);
        if (completedTasks.length === 0) {
            alert('Нет завершённых задач для очистки');
            return;
        }

        if (confirm(`Удалить ${completedTasks.length} завершённых задач?`)) {
            document.querySelectorAll('.task-item.completed').forEach(el => {
                el.classList.add('removed');
            });

            setTimeout(() => {
                this.tasks = this.tasks.filter(task => !task.completed);
                this.saveTasks();
                this.renderTasks();
                this.updateStats();
            }, 300);
        }
    }

    setFilter(filter) {
        this.filter = filter;
        document.querySelectorAll('.filter-btn').forEach(btn =>
            btn.classList.toggle('active', btn.dataset.filter === filter)
        );
        this.renderTasks();
    }

    getFilteredTasks() {
        switch (this.filter) {
            case 'active':
                return this.tasks.filter(task => !task.completed);
            case 'completed':
                return this.tasks.filter(task => task.completed);
            default:
                return this.tasks;
        }
    }

    renderTasks() {
        const taskList = document.getElementById('taskList');
        const filteredTasks = this.getFilteredTasks();

        taskList.innerHTML = filteredTasks.length > 0
            ? filteredTasks.map(task => this.createTaskElement(task)).join('')
            : '<li class="no-tasks">Нет задач для отображения</li>';

        // Обновляем состояние кнопки очистки
        const clearBtn = document.getElementById('clearCompletedBtn');
        if (clearBtn) {
            clearBtn.disabled = this.tasks.filter(t => t.completed).length === 0;
        }
    }

    createTaskElement(task) {
        return `
            <li class="task-item ${task.completed ? 'completed' : ''}" data-id="${task.id}">
                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}
                       onclick="app.toggleTask(${task.id})">
                <span class="task-text">${task.text}</span>
                <button class="edit-btn" onclick="app.editTask(${task.id})">Редактировать</button>
                <button class="delete-btn" onclick="app.deleteTask(${task.id})">Удалить</button>
            </li>
        `;
    }

    updateStats() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(task => task.completed).length;

        const taskCountElement = document.getElementById('taskCount');
        if (taskCountElement) {
            taskCountElement.textContent =
                `${total} задач, из них ${completed} завершено`;
        }

        // Обновляем состояние кнопки очистки завершённых задач
        const clearBtn = document.getElementById('clearCompletedBtn');
        if (clearBtn) {
            clearBtn.disabled = completed === 0;
        }
    }
}

// Инициализация приложения после полной загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
    window.app = new TodoApp();
});
