import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { toast } from "react-hot-toast";
import { useAuth } from "./authContext";

// Create Task Context
const TaskContext = createContext();
export const useTaskContext = () => useContext(TaskContext);

export const TaskProvider = ({ children }) => {
    const { session, loadingAuth } = useAuth();
    const userId = session?.user?.id;

    // States
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const tasksPerPage = 5;
    const [taskFilter, setTaskFilter] = useState("all");

    // Fetch total task count
    const fetchTotalTaskCount = async () => {
        if (!userId) return;

        let query = supabase
            .from("tasks")
            .select("id", { count: "exact" })
            .eq("user_id", userId);

        if (taskFilter === "completed") {
            query = query.eq("is_done", true);
        } else if (taskFilter === "pending") {
            query = query.eq("is_done", false);
        }

        const { count, error } = await query;
        if (error) {
            toast.error("Error fetching task count!");
            return;
        }

        if (count !== null) {
            const newTotalPages = Math.ceil(count / tasksPerPage) || 1;
            setTotalPages(newTotalPages);
            if (currentPage > newTotalPages) {
                setCurrentPage(newTotalPages);
            }
        }
    };

    // Fetch paginated tasks
    const fetchTasks = async () => {
        if (!userId) return;
        setLoading(true);

        let baseQuery = supabase
            .from("tasks")
            .select("*")
            .order("due_date", { ascending: true })
            .eq("user_id", userId);

        if (taskFilter === "completed") {
            baseQuery = baseQuery.eq("is_done", true);
        } else if (taskFilter === "pending") {
            baseQuery = baseQuery.eq("is_done", false);
        }

        const { data: allFilteredTasks, error } = await baseQuery;
        if (error) {
            toast.error("Error fetching tasks!");
            setLoading(false);
            return;
        }

        const start = (currentPage - 1) * tasksPerPage;
        const end = start + tasksPerPage;
        const paginatedTasks = allFilteredTasks.slice(start, end);
        setTasks(paginatedTasks);
        setLoading(false);
    };

    // Subscribe to real-time changes
    useEffect(() => {
        if (!userId) return;

        const channel = supabase
            .channel("realtime-tasks")
            .on("postgres_changes", {
                event: "*",
                schema: "public",
                table: "tasks"
            }, async (payload) => {
                const { eventType, new: newData, old: oldData } = payload;

                // Only respond to current user's data
                const changedUserId = newData?.user_id || oldData?.user_id;
                if (changedUserId !== userId) return;

                const msg = {
                    INSERT: "Task added",
                    UPDATE: "Task updated",
                    DELETE: "Task deleted",
                }[eventType];

                // Always re-fetch tasks and count to keep pagination and filter accurate
                await fetchTotalTaskCount();
                await fetchTasks();

                if (msg) toast.success(msg);
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [userId, taskFilter, currentPage]);

    // Trigger task fetch when filter or page changes
    useEffect(() => {
        if (!userId || loadingAuth) return;
        fetchTotalTaskCount();
        fetchTasks();
    }, [userId, taskFilter, currentPage, loadingAuth]);

    // Add Task
    const addTask = async (title, desc, date) => {
        if (!title || !userId) {
            toast.error("Title and user ID are required!");
            return;
        }

        const { error } = await supabase.from("tasks").insert([{
            title,
            description: desc || "",
            due_date: date,
            user_id: userId
        }]);

        if (error) toast.error("Error adding task!");
    };

    // Edit Task
    const editTask = async (id, updatedTask) => {
        const toastId = toast.loading("Updating task...");
        const { error } = await supabase.from("tasks").update(updatedTask).eq("id", id);

        if (error) {
            toast.error("Error updating task!", { id: toastId });
        } else {
            toast.dismiss(toastId);
        }
    };

    // Delete Task
    const deleteTask = async (id) => {
        const toastId = toast.loading("Deleting task...");
        const { error } = await supabase.from("tasks").delete().eq("id", id);

        if (error) {
            toast.error("Error deleting task!", { id: toastId });
        } else {
            toast.dismiss(toastId);
        }
    };

    // Toggle Task Completion
    const toggleTaskCompletion = async (id, is_done) => {
        const { error } = await supabase
            .from("tasks")
            .update({ is_done: !is_done })
            .eq("id", id);

        if (error) {
            toast.error("Error updating task status!");
        }
    };

    return (
        <TaskContext.Provider value={{
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
        }}>
            {children}
        </TaskContext.Provider>
    );
};
