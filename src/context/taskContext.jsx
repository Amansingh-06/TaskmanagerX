import React, { createContext, useContext, useState, useEffect, useRef } from "react";
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
    const [totalTasks, setTotalTasks] = useState(0); // total tasks count from DB
    const tasksPerPage = 5;
    const [taskFilter, setTaskFilter] = useState("all");

    const ignoreRealtime = useRef(false);

    const matchesFilter = (task) => {
        if (taskFilter === "completed") return task.is_done;
        if (taskFilter === "pending") return !task.is_done;
        return true;
    };

    // Fetch tasks for current page and total count from DB
    const fetchTasks = async () => {
        if (!userId) return;
        setLoading(true);

        // Fetch filtered tasks count
        let query = supabase
            .from("tasks")
            .select("id", { count: "exact" })
            .eq("user_id", userId);

        if (taskFilter === "completed") query = query.eq("is_done", true);
        else if (taskFilter === "pending") query = query.eq("is_done", false);

        const { count, error: countError } = await query;

        if (countError) {
            toast.error("Error fetching task count!");
            setLoading(false);
            return;
        }

        setTotalTasks(count || 0);
        setTotalPages(Math.max(1, Math.ceil((count || 0) / tasksPerPage)));

        // Fetch tasks for current page with filter and pagination
        let taskQuery = supabase
            .from("tasks")
            .select("*")
            .eq("user_id", userId);

        if (taskFilter === "completed") taskQuery = taskQuery.eq("is_done", true);
        else if (taskFilter === "pending") taskQuery = taskQuery.eq("is_done", false);

        const start = (currentPage - 1) * tasksPerPage;

        taskQuery = taskQuery
            .order("due_date", { ascending: true })
            .range(start, start + tasksPerPage - 1);

        const { data, error } = await taskQuery;

        if (error) {
            toast.error("Error fetching tasks!");
        } else {
            setTasks(data || []);
        }

        setLoading(false);
    };

    useEffect(() => {
        if (!userId || loadingAuth) return;
        fetchTasks();
    }, [userId, loadingAuth, taskFilter, currentPage]);

    // Realtime subscription
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
                    filter: `user_id=eq.${userId}`,
                },
                async ({ eventType, new: newTask, old: oldTask }) => {
                    if (ignoreRealtime.current) return;

                    // On any change, refetch tasks to keep consistent pagination & count
                    await fetchTasks();
                }
            )
            .subscribe();

        return () => supabase.removeChannel(channel);
    }, [userId, taskFilter, currentPage]);

    // Add Task
    const addTask = async (title, desc, date) => {
        if (!title || !userId) return toast.error("Title is required!");

        ignoreRealtime.current = true;

        const { data, error } = await supabase
            .from("tasks")
            .insert([{
                title,
                description: desc || "",
                due_date: date,
                user_id: userId,
            }])
            .select();

        ignoreRealtime.current = false;

        if (error) {
            toast.error("Failed to add task");
        } else {
            toast.success("Task added!");
            // Refetch tasks to keep state consistent
            fetchTasks();
        }
    };

    // Edit Task
    const editTask = async (id, updatedTask) => {
        ignoreRealtime.current = true;

        const { error } = await supabase
            .from("tasks")
            .update(updatedTask)
            .eq("id", id);

        ignoreRealtime.current = false;

        if (error) {
            toast.error("Failed to update task");
        } else {
            toast.success("Task updated!");
            fetchTasks();
        }
    };

    // Delete Task
    const deleteTask = async (id) => {
        ignoreRealtime.current = true;

        const { error } = await supabase
            .from("tasks")
            .delete()
            .eq("id", id);

        ignoreRealtime.current = false;

        if (error) {
            toast.error("Failed to delete task");
        } else {
            toast.success("Task deleted!");
            // Refetch to sync pagination and tasks
            fetchTasks();

            // If current page is beyond last page, reset to last page
            setCurrentPage((curPage) => {
                const lastPage = Math.max(1, Math.ceil((totalTasks - 1) / tasksPerPage));
                return curPage > lastPage ? lastPage : curPage;
            });
        }
    };

    // Toggle Completion
    const toggleTaskCompletion = async (id, is_done) => {
        ignoreRealtime.current = true;

        const { error } = await supabase
            .from("tasks")
            .update({ is_done: !is_done })
            .eq("id", id);

        ignoreRealtime.current = false;

        if (error) {
            toast.error("Failed to update status");
        } else {
            toast.success("Status updated!");
            fetchTasks();
        }
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
