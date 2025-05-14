import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Calendar } from "lucide-react";

const TaskDetailsModal = ({ isOpen, onClose, todo }) => {
    if (!todo) return null;
    console.log("todo",todo);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <motion.div
                        className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md relative max-h-[90vh] overflow-y-auto"
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 50, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    >
                        {/* Close button */}
                        <button
                            onClick={onClose}
                            className="absolute top-3 right-3 p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 transition"
                        >
                            <X size={20} />
                        </button>

                        <h2 className="text-2xl font-bold mb-6 text-center text-blue-600">📋 Task Details</h2>

                        <div className="space-y-5 text-gray-700">
                            <div className="border-b pb-3">
                                <p className="text-sm text-gray-500 mb-1">Title</p>
                                <h3 className="text-lg font-semibold">{todo.title}</h3>
                            </div>
                          

                            {todo.description && (
                                <div className="border-b pb-3">
                                    <p className="text-sm text-gray-500 mb-1">Description</p>
                                    <p className="text-base leading-relaxed">{todo.description}</p>
                                </div>
                            )}

                            {todo.due_date && (
                                <div className="flex items-center gap-2 text-sm text-gray-600 border-b pb-3">
                                    <Calendar size={16} />
                                    <span>{todo.due_date}</span>
                                </div>
                            )}

                            <div className="text-center mt-2">
                                <span
                                    className={`inline-block px-4 py-1.5 rounded-full text-xs font-semibold shadow-sm ${todo.completed
                                            ? "bg-green-100 text-green-700"
                                            : "bg-yellow-100 text-yellow-700"
                                        }`}
                                >
                                    {todo.is_done ? "✅ Completed" : "⏳ Pending"}
                                </span>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default TaskDetailsModal;
