import React, { useState } from "react";
import TodoForm from "./TodoForm";
import EditModal from "./EditModel";
import TaskDetailsModal from "./TaskDetailModel";
import { Plus, Calendar } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import TodoItem from "./TodoItem";
import { useAuth } from "../context/authContext";
import { useNavigate } from "react-router-dom";
import { useTaskContext } from "../context/taskContext";
import { Toaster } from "react-hot-toast";
import PaginationControls from "./PaginationControl";

const TodoApp = () => {
    const [showForm, setShowForm] = useState(false);
    const [editingTodo, setEditingTodo] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [viewingTodo, setViewingTodo] = useState(null);

    const { session } = useAuth();
    const login = !!session;
    const nav = useNavigate();

    const {
        tasks,
        addTask,
        loading,
        editTask,
        deleteTask,
        toggleTaskCompletion,
        currentPage,
        setCurrentPage,
        totalPages,
        taskFilter,
        setTaskFilter,
    } = useTaskContext();

    const handleLogin = () => nav("/login");

    const handleEditClick = (todo) => {
        setEditingTodo(todo);
        setIsModalOpen(true);
    };

    const handleViewClick = (todo) => setViewingTodo(todo);

    const handleEditSave = (updatedTodo) => {
        editTask(updatedTodo.id, updatedTodo);
        setIsModalOpen(false);
    };

    // Group tasks by due date (these are already paginated and filtered by context)
    const groupedTasks = tasks.reduce((groups, task) => {
        const date = task.due_date || "No Due Date";
        if (!groups[date]) groups[date] = [];
        groups[date].push(task);
        return groups;
    }, {});

    return (
        <div>
            <div className="max-w-3xl mx-auto space-y-6 md:px-4 py-6 md:mt-20 mt-14 p-3">
                <Toaster position="top-center" reverseOrder={false} />

                <div className="flex justify-between items-center">
                    <h1 className="md:text-3xl font-bold text-blue-600">📝 To-Do List</h1>
                    <button
                        onClick={() => setShowForm((prev) => !prev)}
                        disabled={!login || loading}
                        className={`flex items-center gap-1 md:px-4 py-2 px-1 rounded-lg text-white transition text-sm md:text-lg ${!login || loading
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-blue-600 hover:bg-blue-700"
                            }`}
                    >
                        <Plus size={20} /> Create Task
                    </button>
                </div>

                <div className="flex gap-4 border-b border-gray-300 pb-2">
                    {["All", "Completed", "Pending"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => {
                                setTaskFilter(tab.toLowerCase());
                                setCurrentPage(1);
                            }}
                            className={`pb-1 transition font-medium ${taskFilter === tab.toLowerCase()
                                ? "border-b-2 border-blue-600 text-blue-600 cursor-pointer"
                                : "text-gray-500 hover:text-blue-600 cursor-pointer"
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <AnimatePresence>
                    {showForm && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                        >
                            <TodoForm
                                onAdd={(title, desc, date) => {
                                    addTask(title, desc, date);
                                    setShowForm(false);
                                }}
                                onClose={() => setShowForm(false)}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>

                {login ? (
                    <>
                        {loading ? (
                            <div className="flex justify-center py-10">
                                <div className="h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        ) : (
                            <>
                                {Object.entries(groupedTasks).map(([date, tasksByDate]) => (
                                    <div key={date} className="space-y-2">
                                        <div className="text-md font-semibold text-blue-600 flex items-center gap-2 mt-6">
                                            <Calendar size={18} /> {date}
                                        </div>
                                        {tasksByDate.map((todo) => (
                                            <TodoItem
                                                key={todo.id}
                                                todo={todo}
                                                onDelete={() => deleteTask(todo.id)}
                                                onEdit={() => handleEditClick(todo)}
                                                onView={() => handleViewClick(todo)}
                                            />
                                        ))}
                                    </div>
                                ))}

                                {tasks.length === 0 && (
                                    <div className="text-center text-gray-500 mt-4">
                                        No tasks available. Please add some tasks.
                                    </div>
                                )}

                                {totalPages > 1 && (
                                    <PaginationControls totalPages={totalPages} />
                                )}

                                <EditModal
                                    isOpen={isModalOpen}
                                    onClose={() => setIsModalOpen(false)}
                                    todo={editingTodo}
                                    onSave={handleEditSave}
                                />

                                <TaskDetailsModal
                                    isOpen={!!viewingTodo}
                                    onClose={() => setViewingTodo(null)}
                                    todo={viewingTodo}
                                />
                            </>
                        )}
                    </>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        transition={{ duration: 0.5 }}
                        className="bg-gradient-to-tr from-white via-blue-50 to-blue-100 rounded-2xl p-6 text-center shadow-lg border"
                    >
                        <h2 className="text-xl font-bold text-blue-700 mb-2">Access Denied 🚫</h2>
                        <p className="text-gray-600 mb-4">
                            Please log in to create and manage your tasks.
                        </p>
                        <button
                            onClick={handleLogin}
                                className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition cursor-pointer"
                        >
                            Login to Continue
                        </button>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default TodoApp;
