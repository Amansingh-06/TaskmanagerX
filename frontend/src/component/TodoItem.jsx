import React from "react";
import { Calendar, Trash2, Pencil } from "lucide-react";
import { motion } from "framer-motion";
import { useTaskContext } from "../context/taskContext";

const TodoItem = ({ todo, onToggle, onDelete, onEdit, onView }) => {
    const handleViewClick = () => {
        if (onView) {
            onView(todo);
        }
    };

    const { tasks, toggleTaskCompletion } = useTaskContext();

    return (
        <motion.div
            className="space-y-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
        >
            <motion.div
                whileHover={{ scale: 1.03 }}
                className={`p-4 bg-white rounded-xl shadow-md hover:shadow-lg transition-all flex justify-between items-center gap-4 ${todo.is_done ? "opacity-60" : ""}`}
                onClick={handleViewClick}  // Add onClick to the whole item
            >
                <div className="flex items-center gap-3">
                    <div onClick={(e) => e.stopPropagation()}>
                        <input
                            type="checkbox"
                            className=" w-4 h-4"
                            checked={todo.is_done}
                            onChange={() => toggleTaskCompletion(todo.id, todo.is_done)}
                        />
                    </div>

                    <div className="cursor-pointer">
                        <h2 className={`text-lg font-semibold transition-all ${todo.is_done ? "line-through text-gray-500" : ""}`}>
                            {todo.title}
                        </h2>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div onClick={(e) => { e.stopPropagation(); onEdit(todo); }} className="text-blue-500 hover:text-blue-700 transition-colors cursor-pointer">
                        <Pencil size={20} />
                    </div>

                    <div onClick={(e) => { e.stopPropagation(); onDelete(todo.id); }} className="text-red-500 hover:text-red-700 transition-colors cursor-pointer">
                        <Trash2 size={20} />
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default TodoItem;
