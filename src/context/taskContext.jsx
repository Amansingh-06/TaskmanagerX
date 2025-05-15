import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { toast } from "react-hot-toast";
import { useAuth } from "./authContext";

const TaskContext = createContext();
export const useTaskContext = () => useContext(TaskContext);

export const TaskProvider = ({ children }) => {
    const { session, loadingAuth } = useAuth();
    const userId = session?.user?.id;

    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const tasksPerPage = 5;
    const [taskFilter, setTaskFilter] = useState("all");

    const matchesFilter = (task) => {
        if (taskFilter === "completed") return task.is_done;
        if (taskFilter === "pending") return !task.is_done;
        return true;
    };

    const applyPagination = (data) => {
        const filtered = data.filter(matchesFilter);
        const start = (currentPage - 1) * tasksPerPage;
        const end = start + tasksPerPage;
        const paginated = filtered.slice(start, end);
        setTasks(paginated);
        setTotalPages(Math.max(1, Math.ceil(filtered.length / tasksPerPage)));
    };

    const fetchTasks = async () => {
        if (!userId) return;
        setLoading(true);

        const { data, error } = await supabase
            .from("tasks")
            .select("*")
            .eq("user_id", userId)
            .order("due_date", { ascending: true });

        if (error) {
            toast.error("Error fetching tasks!");
        } else {
            applyPagination(data);
        }

        setLoading(false);
    };

    useEffect(() => {
        if (!userId || loadingAuth) return;
        fetchTasks();
    }, [userId, loadingAuth, taskFilter, currentPage]);

    // 🔁 Real-time Sync
    useEffect(() => {
        if (!userId) return;

        const channel = supabase
            .channel("realtime-tasks")
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "tasks",
                },
                ({ eventType, new: newTask, old: oldTask }) => {
                    const taskUser = newTask?.user_id || oldTask?.user_id;
                    if (taskUser !== userId) return;

                    setTasks((prev) => {
                        let updated = [...prev];

                        const newMatches = newTask && matchesFilter(newTask);
                        const oldMatches = oldTask && matchesFilter(oldTask);

                        if (eventType === "INSERT" && newMatches) {
                            updated = [newTask, ...prev].slice(0, tasksPerPage);
                        } else if (eventType === "UPDATE") {
                            if (newMatches) {
                                updated = updated.map(t => t.id === newTask.id ? newTask : t);
                            } else {
                                updated = updated.filter(t => t.id !== oldTask.id);
                            }
                        } else if (eventType === "DELETE" && oldMatches) {
                            updated = updated.filter(t => t.id !== oldTask.id);
                        }

                        return updated;
                    });

                    setTotalPages((prevTotal) => {
                        let countAdjustment = 0;
                        if (eventType === "INSERT" && matchesFilter(newTask)) countAdjustment = 1;
                        if (eventType === "DELETE" && matchesFilter(oldTask)) countAdjustment = -1;
                        const newTotalItems = tasks.length + countAdjustment;
                        return Math.max(1, Math.ceil(newTotalItems / tasksPerPage));
                    });
                }
            )
            .subscribe();

        return () => supabase.removeChannel(channel);
    }, [userId, taskFilter, currentPage]);

    // 🟢 Add Task
    const addTask = async (title, desc, date) => {
        if (!title || !userId) return toast.error("Title is required!");

        const promise = supabase.from("tasks").insert([{
            title,
            description: desc || "",
            due_date: date,
            user_id: userId,
        }]);

        await toast.promise(promise, {
            loading: "Adding task...",
            success: "Task added!",
            error: "Failed to add task",
        });
    };

    // ✏️ Edit Task
    const editTask = async (id, updatedTask) => {
        const promise = supabase
            .from("tasks")
            .update(updatedTask)
            .eq("id", id);

        await toast.promise(promise, {
            loading: "Updating task...",
            success: "Task updated!",
            error: "Failed to update task",
        });
    };

    // ❌ Delete Task
    const deleteTask = async (id) => {
        const promise = supabase
            .from("tasks")
            .delete()
            .eq("id", id);

        await toast.promise(promise, {
            loading: "Deleting task...",
            success: "Task deleted!",
            error: "Failed to delete task",
        });
    };

    // ✅ Toggle Completion
    const toggleTaskCompletion = async (id, is_done) => {
        const promise = supabase
            .from("tasks")
            .update({ is_done: !is_done })
            .eq("id", id);

        await toast.promise(promise, {
            loading: "Updating status...",
            success: "Status updated!",
            error: "Failed to update status",
        });
    };

    return (
        <TaskContext.Provider
            value={{
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
            }}
        >
            {children}
        </TaskContext.Provider>
    );
};
