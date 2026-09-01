/**
 * ==============================================================================
 * THIRANEX INTERNSHIP - TASK 3: JAVASCRIPT LOGIC & STATE MANAGEMENT
 * Interactive Client-Side To-Do List Application
 * ==============================================================================
 * Features:
 * - State-driven architecture with single source of truth
 * - Full CRUD Operations (Create, Read, Update, Delete)
 * - Automatic persistence via window.localStorage
 * - Advanced Filtering (All, Active, Completed, Category, Priority, Search Query)
 * - Multi-criteria sorting (Date, Priority, Due Date, Alphabetical)
 * - Dynamic DOM manipulation with centralized Event Delegation
 * - Dark / Light theme switching with persistence
 * - Micro-interactions, Undo capability, and accessibility support
 * ==============================================================================
 */

'use strict';

// Default initial tasks for first-time visitors
const DEFAULT_TASKS = [
    {
        id: 1709280001001,
        text: 'Master JavaScript DOM manipulation & Event Delegation',
        completed: true,
        priority: 'high',
        category: 'Study',
        dueDate: '2026-09-08',
        createdAt: 1709280001001
    },
    {
        id: 1709280002002,
        text: 'Implement LocalStorage persistence for state management',
        completed: false,
        priority: 'high',
        category: 'Work',
        dueDate: '2026-09-08',
        createdAt: 1709280002002
    },
    {
        id: 1709280003003,
        text: 'Build advanced search & filtering controls',
        completed: false,
        priority: 'medium',
        category: 'Work',
        dueDate: '2026-09-09',
        createdAt: 1709280003003
    },
    {
        id: 1709280004004,
        text: 'Review responsive CSS design and theme switcher',
        completed: false,
        priority: 'low',
        category: 'Personal',
        dueDate: '',
        createdAt: 1709280004004
    }
];

// LocalStorage Keys
const STORAGE_KEYS = {
    TODOS: 'thiranex_task3_todos',
    THEME: 'thiranex_task3_theme',
    FILTER: 'thiranex_task3_filter',
    SORT: 'thiranex_task3_sort'
};

/* ==============================================================================
   APPLICATION STATE
   ============================================================================== */

const state = {
    todos: [],
    filter: 'all',          // 'all' | 'active' | 'completed'
    searchQuery: '',
    categoryFilter: 'all',  // 'all' | 'Work' | 'Study' | 'Personal' | 'Health' | 'Other'
    priorityFilter: 'all',  // 'all' | 'high' | 'medium' | 'low'
    sortBy: 'newest',       // 'newest' | 'oldest' | 'priority' | 'dueDate' | 'alphabetical'
    theme: 'light',
    lastDeletedTodo: null,  // For Undo support
    undoTimer: null
};

/* ==============================================================================
   DOM ELEMENT SELECTORS
   ============================================================================== */

const DOM = {
    html: document.documentElement,
    themeToggle: document.getElementById('theme-toggle'),
    dateDisplay: document.getElementById('date-display'),
    
    // Stats elements
    totalCount: document.getElementById('total-count'),
    activeCount: document.getElementById('active-count'),
    completedCount: document.getElementById('completed-count'),
    progressPercent: document.getElementById('progress-percent'),
    progressFill: document.getElementById('progress-fill'),
    visibleCount: document.getElementById('visible-count'),

    // Tab badges
    badgeAll: document.getElementById('tab-badge-all'),
    badgeActive: document.getElementById('tab-badge-active'),
    badgeCompleted: document.getElementById('tab-badge-completed'),

    // Add Task Form
    todoForm: document.getElementById('todo-form'),
    todoInput: document.getElementById('todo-input'),
    todoPriority: document.getElementById('todo-priority'),
    todoCategory: document.getElementById('todo-category'),
    todoDueDate: document.getElementById('todo-due-date'),

    // Controls
    searchInput: document.getElementById('search-input'),
    clearSearchBtn: document.getElementById('clear-search-btn'),
    filterTabs: document.querySelectorAll('.filter-tab'),
    categoryFilter: document.getElementById('category-filter'),
    priorityFilter: document.getElementById('priority-filter'),
    sortSelect: document.getElementById('sort-select'),

    // Task List & Bulk Actions
    todoList: document.getElementById('todo-list'),
    emptyState: document.getElementById('empty-state'),
    emptyStateTitle: document.getElementById('empty-state-title'),
    emptyStateDesc: document.getElementById('empty-state-desc'),
    clearCompletedBtn: document.getElementById('clear-completed-btn'),
    clearAllBtn: document.getElementById('clear-all-btn'),

    // Toast
    toast: document.getElementById('toast'),
    toastMessage: document.getElementById('toast-message'),
    toastUndoBtn: document.getElementById('toast-undo-btn')
};

/* ==============================================================================
   LOCAL STORAGE SERVICE
   ============================================================================== */

/**
 * Loads persisted data from window.localStorage
 */
function loadStateFromStorage() {
    try {
        const storedTodos = localStorage.getItem(STORAGE_KEYS.TODOS);
        if (storedTodos !== null) {
            state.todos = JSON.parse(storedTodos);
        } else {
            // First visit: initialize with default sample tasks
            state.todos = [...DEFAULT_TASKS];
            saveTodosToStorage();
        }

        const storedTheme = localStorage.getItem(STORAGE_KEYS.THEME);
        if (storedTheme) {
            state.theme = storedTheme;
        } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            state.theme = 'dark';
        }

        const storedFilter = localStorage.getItem(STORAGE_KEYS.FILTER);
        if (storedFilter) {
            state.filter = storedFilter;
        }

        const storedSort = localStorage.getItem(STORAGE_KEYS.SORT);
        if (storedSort) {
            state.sortBy = storedSort;
        }
    } catch (error) {
        console.error('Error loading data from localStorage:', error);
        state.todos = [...DEFAULT_TASKS];
    }
}

/**
 * Saves current todos to window.localStorage
 */
function saveTodosToStorage() {
    try {
        localStorage.setItem(STORAGE_KEYS.TODOS, JSON.stringify(state.todos));
    } catch (error) {
        console.error('Error saving todos to localStorage:', error);
    }
}

/**
 * Saves preference settings to localStorage
 */
function savePreferencesToStorage() {
    try {
        localStorage.setItem(STORAGE_KEYS.THEME, state.theme);
        localStorage.setItem(STORAGE_KEYS.FILTER, state.filter);
        localStorage.setItem(STORAGE_KEYS.SORT, state.sortBy);
    } catch (error) {
        console.error('Error saving preferences to localStorage:', error);
    }
}

/* ==============================================================================
   CORE CRUD OPERATIONS
   ============================================================================== */

/**
 * CREATE: Adds a new task to the state
 */
function addTodo(taskData) {
    const trimmedText = taskData.text.trim();
    if (!trimmedText) return;

    const newTodo = {
        id: Date.now() + Math.floor(Math.random() * 1000),
        text: trimmedText,
        completed: false,
        priority: taskData.priority || 'medium',
        category: taskData.category || 'Work',
        dueDate: taskData.dueDate || '',
        createdAt: Date.now()
    };

    state.todos.unshift(newTodo);
    saveTodosToStorage();
    render();
    showToast('Task added successfully!');
}

/**
 * UPDATE: Toggles completion status of a task by ID
 */
function toggleTodo(id) {
    const todo = state.todos.find(item => item.id === id);
    if (!todo) return;

    todo.completed = !todo.completed;
    saveTodosToStorage();
    render();

    if (todo.completed) {
        showToast('Task marked as completed! 🎉');
    }
}

/**
 * UPDATE: Edits the text content of a task
 */
function updateTodoText(id, newText) {
    const trimmed = newText.trim();
    const todo = state.todos.find(item => item.id === id);
    if (!todo) return;

    if (!trimmed) {
        // If text is emptied, delete the task
        deleteTodo(id);
        return;
    }

    if (todo.text !== trimmed) {
        todo.text = trimmed;
        saveTodosToStorage();
        render();
        showToast('Task updated!');
    } else {
        render();
    }
}

/**
 * DELETE: Removes a task by ID and allows Undo
 */
function deleteTodo(id) {
    const todoIndex = state.todos.findIndex(item => item.id === id);
    if (todoIndex === -1) return;

    const [deleted] = state.todos.splice(todoIndex, 1);
    state.lastDeletedTodo = { todo: deleted, index: todoIndex };

    saveTodosToStorage();
    render();
    showToast('Task deleted', true);
}

/**
 * UNDO: Restores the last deleted task
 */
function undoDelete() {
    if (!state.lastDeletedTodo) return;

    const { todo, index } = state.lastDeletedTodo;
    state.todos.splice(Math.min(index, state.todos.length), 0, todo);
    state.lastDeletedTodo = null;

    saveTodosToStorage();
    render();
    hideToast();
    showToast('Task restored!');
}

/**
 * DELETE: Clears all completed tasks
 */
function clearCompletedTodos() {
    const completedCount = state.todos.filter(t => t.completed).length;
    if (completedCount === 0) {
        showToast('No completed tasks to clear.');
        return;
    }

    if (confirm(`Remove ${completedCount} completed task(s)?`)) {
        state.todos = state.todos.filter(t => !t.completed);
        saveTodosToStorage();
        render();
        showToast(`Cleared ${completedCount} completed task(s)!`);
    }
}

/**
 * DELETE: Clears all tasks
 */
function clearAllTodos() {
    if (state.todos.length === 0) {
        showToast('Task list is already empty.');
        return;
    }

    if (confirm('Are you sure you want to delete ALL tasks? This action cannot be undone.')) {
        state.todos = [];
        saveTodosToStorage();
        render();
        showToast('All tasks cleared.');
    }
}

/* ==============================================================================
   FILTERING & SORTING LOGIC
   ============================================================================== */

/**
 * Returns filtered and sorted array of todos based on current state
 */
function getFilteredAndSortedTodos() {
    let result = [...state.todos];

    // 1. Status Filter (All / Active / Completed)
    if (state.filter === 'active') {
        result = result.filter(todo => !todo.completed);
    } else if (state.filter === 'completed') {
        result = result.filter(todo => todo.completed);
    }

    // 2. Category Filter
    if (state.categoryFilter !== 'all') {
        result = result.filter(todo => todo.category === state.categoryFilter);
    }

    // 3. Priority Filter
    if (state.priorityFilter !== 'all') {
        result = result.filter(todo => todo.priority === state.priorityFilter);
    }

    // 4. Search Query Filter
    if (state.searchQuery) {
        const query = state.searchQuery.toLowerCase();
        result = result.filter(todo =>
            todo.text.toLowerCase().includes(query) ||
            todo.category.toLowerCase().includes(query)
        );
    }

    // 5. Sorting
    const priorityWeights = { high: 3, medium: 2, low: 1 };

    result.sort((a, b) => {
        switch (state.sortBy) {
            case 'oldest':
                return a.createdAt - b.createdAt;
            case 'priority':
                return (priorityWeights[b.priority] || 0) - (priorityWeights[a.priority] || 0);
            case 'dueDate':
                if (!a.dueDate) return 1;
                if (!b.dueDate) return -1;
                return new Date(a.dueDate) - new Date(b.dueDate);
            case 'alphabetical':
                return a.text.localeCompare(b.text);
            case 'newest':
            default:
                return b.createdAt - a.createdAt;
        }
    });

    return result;
}

/* ==============================================================================
   DOM RENDERING FUNCTIONS
   ============================================================================== */

/**
 * Sanitizes strings for safe DOM insertion to prevent XSS
 */
function escapeHTML(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

/**
 * Formats a date string (YYYY-MM-DD) into readable format
 */
function formatDueDate(dateStr) {
    if (!dateStr) return null;
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const date = new Date(parts[0], parts[1] - 1, parts[2]);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

/**
 * Checks if a given due date is overdue
 */
function isOverdue(dateStr, isCompleted) {
    if (!dateStr || isCompleted) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [year, month, day] = dateStr.split('-');
    const dueDate = new Date(year, month - 1, day);
    return dueDate < today;
}

/**
 * Builds a single dynamic DOM <li> element for a task
 */
function createTodoElement(todo) {
    const li = document.createElement('li');
    li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
    li.dataset.id = todo.id;

    // Checkbox and text container
    const leftContent = document.createElement('div');
    leftContent.className = 'todo-left-content';

    // Custom Accessible Checkbox
    const checkboxLabel = document.createElement('label');
    checkboxLabel.className = 'custom-checkbox-label';
    checkboxLabel.title = todo.completed ? 'Mark pending' : 'Mark completed';

    const checkboxInput = document.createElement('input');
    checkboxInput.type = 'checkbox';
    checkboxInput.className = 'checkbox-input';
    checkboxInput.checked = todo.completed;
    checkboxInput.setAttribute('aria-label', `Mark task "${todo.text}" as ${todo.completed ? 'incomplete' : 'complete'}`);

    const checkboxBox = document.createElement('div');
    checkboxBox.className = 'checkbox-box';
    checkboxBox.innerHTML = `
        <svg class="checkbox-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
    `;

    checkboxLabel.appendChild(checkboxInput);
    checkboxLabel.appendChild(checkboxBox);

    // Details (Title + Badges)
    const details = document.createElement('div');
    details.className = 'todo-details';

    const textSpan = document.createElement('span');
    textSpan.className = 'todo-text';
    textSpan.textContent = todo.text;
    textSpan.title = 'Double click to edit task';

    // Meta Badges Container
    const badgesWrapper = document.createElement('div');
    badgesWrapper.className = 'todo-meta-badges';

    // 1. Priority Badge
    const priorityBadge = document.createElement('span');
    priorityBadge.className = `badge priority-${todo.priority}`;
    const priorityIcons = { high: '🔥', medium: '⚡', low: '🌱' };
    priorityBadge.textContent = `${priorityIcons[todo.priority] || ''} ${todo.priority}`;
    badgesWrapper.appendChild(priorityBadge);

    // 2. Category Badge
    const categoryBadge = document.createElement('span');
    categoryBadge.className = 'badge category-badge';
    const categoryIcons = { Work: '💼', Study: '📚', Personal: '👤', Health: '🏃', Other: '📌' };
    categoryBadge.textContent = `${categoryIcons[todo.category] || '📌'} ${todo.category}`;
    badgesWrapper.appendChild(categoryBadge);

    // 3. Due Date Badge (if specified)
    if (todo.dueDate) {
        const formattedDate = formatDueDate(todo.dueDate);
        const overdue = isOverdue(todo.dueDate, todo.completed);
        const dueBadge = document.createElement('span');
        dueBadge.className = `badge due-badge ${overdue ? 'overdue' : ''}`;
        dueBadge.innerHTML = `
            <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            ${overdue ? 'Overdue: ' : 'Due: '}${formattedDate}
        `;
        badgesWrapper.appendChild(dueBadge);
    }

    details.appendChild(textSpan);
    details.appendChild(badgesWrapper);

    leftContent.appendChild(checkboxLabel);
    leftContent.appendChild(details);

    // Actions (Edit & Delete Buttons)
    const actions = document.createElement('div');
    actions.className = 'todo-actions';

    // Edit Button
    const editBtn = document.createElement('button');
    editBtn.type = 'button';
    editBtn.className = 'action-btn edit-btn';
    editBtn.title = 'Edit task';
    editBtn.setAttribute('aria-label', `Edit task "${todo.text}"`);
    editBtn.innerHTML = `
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
        </svg>
    `;

    // Delete Button
    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'action-btn delete-btn';
    deleteBtn.title = 'Delete task';
    deleteBtn.setAttribute('aria-label', `Delete task "${todo.text}"`);
    deleteBtn.innerHTML = `
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            <line x1="10" y1="11" x2="10" y2="17"></line>
            <line x1="14" y1="11" x2="14" y2="17"></line>
        </svg>
    `;

    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);

    li.appendChild(leftContent);
    li.appendChild(actions);

    return li;
}

/**
 * Initiates inline editing mode for a task item
 */
function enterInlineEditMode(todoItemElement) {
    const id = Number(todoItemElement.dataset.id);
    const todo = state.todos.find(t => t.id === id);
    if (!todo) return;

    const details = todoItemElement.querySelector('.todo-details');
    const existingTextSpan = details.querySelector('.todo-text');
    if (!existingTextSpan) return;

    const currentText = todo.text;
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'todo-inline-input';
    input.value = currentText;
    input.maxLength = 160;

    // Replace text element with inline input
    details.replaceChild(input, existingTextSpan);
    input.focus();
    input.select();

    let isSaved = false;

    const saveEdit = () => {
        if (isSaved) return;
        isSaved = true;
        updateTodoText(id, input.value);
    };

    const cancelEdit = () => {
        if (isSaved) return;
        isSaved = true;
        render();
    };

    input.addEventListener('blur', saveEdit);

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            input.blur();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            input.removeEventListener('blur', saveEdit);
            cancelEdit();
        }
    });
}

/**
 * Main render function that synchronizes state with the DOM
 */
function render() {
    // 1. Calculate & Render Statistics
    const total = state.todos.length;
    const completed = state.todos.filter(t => t.completed).length;
    const active = total - completed;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

    DOM.totalCount.textContent = total;
    DOM.activeCount.textContent = active;
    DOM.completedCount.textContent = completed;
    DOM.progressPercent.textContent = `${percent}%`;
    DOM.progressFill.style.width = `${percent}%`;

    // 2. Update Tab Badges
    DOM.badgeAll.textContent = total;
    DOM.badgeActive.textContent = active;
    DOM.badgeCompleted.textContent = completed;

    // 3. Update Filter Tabs UI Active State
    DOM.filterTabs.forEach(tab => {
        const tabFilter = tab.dataset.filter;
        const isActive = tabFilter === state.filter;
        tab.classList.toggle('active', isActive);
        tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });

    // 4. Update Dropdown Filter Values
    DOM.categoryFilter.value = state.categoryFilter;
    DOM.priorityFilter.value = state.priorityFilter;
    DOM.sortSelect.value = state.sortBy;

    // 5. Filter & Render Task Items
    const filteredTodos = getFilteredAndSortedTodos();
    DOM.visibleCount.textContent = filteredTodos.length;

    // Clear previous DOM task nodes
    DOM.todoList.innerHTML = '';

    if (filteredTodos.length === 0) {
        DOM.emptyState.style.display = 'flex';

        // Contextual Empty State Messages
        if (state.searchQuery) {
            DOM.emptyStateTitle.textContent = 'No matching tasks found';
            DOM.emptyStateDesc.textContent = `No tasks matching "${state.searchQuery}". Try a different keyword.`;
        } else if (state.filter === 'active') {
            DOM.emptyStateTitle.textContent = 'No active tasks';
            DOM.emptyStateDesc.textContent = 'Awesome job! You have completed all your pending tasks.';
        } else if (state.filter === 'completed') {
            DOM.emptyStateTitle.textContent = 'No completed tasks';
            DOM.emptyStateDesc.textContent = 'Get started by checking off tasks as you finish them!';
        } else if (state.categoryFilter !== 'all' || state.priorityFilter !== 'all') {
            DOM.emptyStateTitle.textContent = 'No matching tasks for current filters';
            DOM.emptyStateDesc.textContent = 'Try adjusting your category or priority filter.';
        } else {
            DOM.emptyStateTitle.textContent = 'Your task list is empty';
            DOM.emptyStateDesc.textContent = 'Start your day by adding your first task above!';
        }
    } else {
        DOM.emptyState.style.display = 'none';

        const fragment = document.createDocumentFragment();
        filteredTodos.forEach(todo => {
            const node = createTodoElement(todo);
            fragment.appendChild(node);
        });
        DOM.todoList.appendChild(fragment);
    }

    // Toggle search clear button
    DOM.clearSearchBtn.style.display = state.searchQuery ? 'flex' : 'none';
}

/* ==============================================================================
   TOAST NOTIFICATION SYSTEM
   ============================================================================== */

function showToast(message, showUndo = false) {
    if (state.undoTimer) {
        clearTimeout(state.undoTimer);
    }

    DOM.toastMessage.textContent = message;
    DOM.toastUndoBtn.style.display = showUndo ? 'inline-block' : 'none';
    DOM.toast.classList.add('show');

    state.undoTimer = setTimeout(() => {
        hideToast();
    }, 4000);
}

function hideToast() {
    DOM.toast.classList.remove('show');
    if (state.undoTimer) {
        clearTimeout(state.undoTimer);
        state.undoTimer = null;
    }
}

/* ==============================================================================
   EVENT HANDLERS & EVENT DELEGATION
   ============================================================================== */

/**
 * Initializes all event listeners across the application
 */
function initEventListeners() {
    // 1. ADD TASK FORM SUBMIT
    DOM.todoForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const text = DOM.todoInput.value;
        const priority = DOM.todoPriority.value;
        const category = DOM.todoCategory.value;
        const dueDate = DOM.todoDueDate.value;

        addTodo({ text, priority, category, dueDate });

        // Reset form inputs & refocus
        DOM.todoInput.value = '';
        DOM.todoDueDate.value = '';
        DOM.todoInput.focus();
    });

    // 2. CENTRALIZED EVENT DELEGATION ON TODO LIST (Click & Double Click)
    DOM.todoList.addEventListener('click', (e) => {
        const item = e.target.closest('.todo-item');
        if (!item) return;

        const id = Number(item.dataset.id);

        // A. DELETE BUTTON
        if (e.target.closest('.delete-btn')) {
            deleteTodo(id);
            return;
        }

        // B. EDIT BUTTON
        if (e.target.closest('.edit-btn')) {
            enterInlineEditMode(item);
            return;
        }
    });

    // Handle Checkbox Change Events (Delegation)
    DOM.todoList.addEventListener('change', (e) => {
        if (e.target.classList.contains('checkbox-input')) {
            const item = e.target.closest('.todo-item');
            if (!item) return;
            const id = Number(item.dataset.id);
            toggleTodo(id);
        }
    });

    // Double Click to Edit Task
    DOM.todoList.addEventListener('dblclick', (e) => {
        const item = e.target.closest('.todo-item');
        if (item && !item.querySelector('.todo-inline-input')) {
            enterInlineEditMode(item);
        }
    });

    // 3. FILTER TABS (All / Active / Completed)
    DOM.filterTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const selectedFilter = tab.dataset.filter;
            if (state.filter !== selectedFilter) {
                state.filter = selectedFilter;
                savePreferencesToStorage();
                render();
            }
        });
    });

    // 4. DROPDOWN FILTERS & SORT
    DOM.categoryFilter.addEventListener('change', (e) => {
        state.categoryFilter = e.target.value;
        render();
    });

    DOM.priorityFilter.addEventListener('change', (e) => {
        state.priorityFilter = e.target.value;
        render();
    });

    DOM.sortSelect.addEventListener('change', (e) => {
        state.sortBy = e.target.value;
        savePreferencesToStorage();
        render();
    });

    // 5. SEARCH INPUT WITH REAL-TIME FILTERING
    DOM.searchInput.addEventListener('input', (e) => {
        state.searchQuery = e.target.value.trim();
        render();
    });

    DOM.clearSearchBtn.addEventListener('click', () => {
        DOM.searchInput.value = '';
        state.searchQuery = '';
        render();
        DOM.searchInput.focus();
    });

    // 6. BULK ACTIONS
    DOM.clearCompletedBtn.addEventListener('click', clearCompletedTodos);
    DOM.clearAllBtn.addEventListener('click', clearAllTodos);

    // 7. TOAST UNDO ACTION
    DOM.toastUndoBtn.addEventListener('click', undoDelete);

    // 8. THEME TOGGLE
    DOM.themeToggle.addEventListener('click', () => {
        state.theme = state.theme === 'light' ? 'dark' : 'light';
        DOM.html.setAttribute('data-theme', state.theme);
        savePreferencesToStorage();
        showToast(`${state.theme.charAt(0).toUpperCase() + state.theme.slice(1)} theme activated`);
    });

    // 9. GLOBAL KEYBOARD SHORTCUTS
    document.addEventListener('keydown', (e) => {
        // Press '/' to quickly focus the search bar (unless currently in an input)
        if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'SELECT') {
            e.preventDefault();
            DOM.searchInput.focus();
        }
    });
}

/**
 * Initializes and formats today's date in header
 */
function initCurrentDate() {
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    const todayFormatted = new Date().toLocaleDateString(undefined, options);
    DOM.dateDisplay.textContent = todayFormatted;
}

/* ==============================================================================
   APP INITIALIZATION
   ============================================================================== */

function initApp() {
    loadStateFromStorage();
    DOM.html.setAttribute('data-theme', state.theme);
    initCurrentDate();
    initEventListeners();
    render();
}

// Start application once DOM is fully parsed
document.addEventListener('DOMContentLoaded', initApp);

