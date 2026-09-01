# TaskMaster — Interactive JavaScript Logic & State Management To-Do Application

**Thiranex Web Development Internship — Task 3**

A responsive, client-side To-Do List web application showcasing DOM manipulation, centralized event delegation, state management, advanced multi-criteria filtering, and local data persistence via `window.localStorage`.

---

## 🚀 Live Demo & Key Highlights

- **Full CRUD Operations**: Create tasks with rich metadata, Read dynamically with live statistics, Update completion & inline editing, and Delete with instant Undo capability.
- **Client-Side Persistence**: Automatic synchronization of tasks, active filters, and theme preferences to `window.localStorage`.
- **Advanced Filtering & Search**: Filter by status (**All**, **Active**, **Completed**), category, priority, and real-time live search query.
- **Dynamic DOM & Event Delegation**: High-performance single-listener pattern on list containers with dynamic semantic element generation.
- **Design System & Theming**: Polished light and dark mode with CSS custom properties, micro-animations, and responsive layouts across all device viewports.

---

## 📋 Requirements & Features Matrix

| Requirement | Implementation Detail | Status |
| :--- | :--- | :---: |
| **Full CRUD Functionality** | Add, read, inline edit (`Enter` / `Esc`), toggle complete, delete individual, clear completed, clear all. | ✅ Complete |
| **Local Data Persistence** | Uses `window.localStorage` to store state across browser sessions & reloads with fallback sample tasks. | ✅ Complete |
| **Advanced Filtering** | Tabbed filters (**All**, **Active**, **Completed**) with live counter badges, plus Category & Priority dropdowns. | ✅ Complete |
| **Search & Sorting** | Real-time substring search with clear button, plus multi-mode sorting (Newest, Oldest, Priority, Due Date, Alphabetical). | ✅ Complete |
| **Dynamic DOM Manipulation** | Generates dynamic semantic `<li>` structures with custom styled checkboxes, badges, and action buttons. | ✅ Complete |
| **Event Delegation** | Centralized `click`, `change`, and `dblclick` listeners on `#todo-list` utilizing `e.target.closest()`. | ✅ Complete |
| **Modern Responsive UI** | Custom CSS variables, Dark/Light mode toggle, progress bar, responsive grid/flexbox layout. | ✅ Complete |
| **Accessibility (a11y)** | ARIA labels, semantic landmark elements, keyboard shortcuts (`/` for search, `Enter`, `Escape`), focus rings. | ✅ Complete |

---

## 🛠️ Architecture & State Management

The application adheres to a clean, unidirectional state-driven pattern:

```
[User Interaction] ➡️ [Event Listener (Delegation)] ➡️ [State Mutation Function] ➡️ [Sync to LocalStorage] ➡️ [Render Function] ➡️ [DOM Update]
```

### 1. State Structure (`app.js`)
```javascript
const state = {
    todos: [
        {
            id: 1709280001001,
            text: "Task description",
            completed: false,
            priority: "high" | "medium" | "low",
            category: "Work" | "Study" | "Personal" | "Health" | "Other",
            dueDate: "2026-09-08",
            createdAt: 1709280001001
        }
    ],
    filter: 'all',          // 'all' | 'active' | 'completed'
    searchQuery: '',        // Real-time search query
    categoryFilter: 'all',
    priorityFilter: 'all',
    sortBy: 'newest',       // 'newest' | 'oldest' | 'priority' | 'dueDate' | 'alphabetical'
    theme: 'light'          // 'light' | 'dark'
};
```

### 2. Event Delegation
Instead of binding individual event listeners to every task node, a single centralized listener is attached to the parent `#todo-list`:
```javascript
DOM.todoList.addEventListener('click', (e) => {
    const item = e.target.closest('.todo-item');
    if (!item) return;
    const id = Number(item.dataset.id);

    if (e.target.closest('.delete-btn')) {
        deleteTodo(id);
    } else if (e.target.closest('.edit-btn')) {
        enterInlineEditMode(item);
    }
});
```

---

## 📂 Project Structure

```
Thiranex-Task-3/
├── index.html       # Semantic HTML5 layout with form, controls, stats, and list container
├── style.css        # CSS custom properties, responsive design, animations, and dark/light themes
├── app.js           # Core state logic, CRUD methods, DOM rendering, and event delegation
└── README.md        # Comprehensive documentation and guide
```

---

## ⌨️ Keyboard Shortcuts

- <kbd>Enter</kbd> : Add new task / Save inline task edit
- <kbd>Escape</kbd> : Cancel inline task edit
- <kbd>/</kbd> : Instantly focus the search bar
- <kbd>Double Click</kbd> : Trigger inline edit mode on any task

---

## 💻 How to Run Locally

1. Open the project folder `Thiranex-Task-3`.
2. Double click `index.html` or open it with any modern web browser (Google Chrome, Microsoft Edge, Mozilla Firefox, Safari).
3. Alternatively, serve with VS Code Live Server or any static HTTP server:
   ```bash
   npx serve .
   ```

---

## 👨‍💻 Author

Created for **Thiranex Web Development Internship — Task 3**.

