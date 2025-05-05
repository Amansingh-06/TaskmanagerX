import React from "react";
import TodoItem from "./TodoItem";
import { useTaskContext } from "../context/taskContext";

const TodoList = () => {
    const { tasks, toggleTaskCompletion, deleteTask } = useTaskContext();

    return (
        <div className="space-y-3">
            {tasks.length ? (
                tasks.map((task) => (
                    <TodoItem
                        key={task.id}
                        todo={task}
                        onToggle={() => toggleTaskCompletion(task.id)}
                        onDelete={() => deleteTask(task.id)}
                    />
                ))
            ) : (
                <p className="text-center text-gray-500">No tasks to show.</p>
            )}
        </div>
    );
};

export default TodoList;
