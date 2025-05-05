import React from "react";
import { X } from "lucide-react";
import TodoForm from "./TodoForm"; // Import TodoForm

const EditModal = ({ isOpen, onClose, todo, onSave }) => {
    const handleSave = (title, description, date) => {
        // If a todo exists, update it, otherwise add a new one
        if (todo) {
            onSave({ ...todo, title, description, due_date: date, is_done: todo.is_done });
        } else {
            onSave({ title, description, due_date: date, is_done: false });
        }
        onClose();
    };

    return (
        <>
            {isOpen && (
                <div className="fixed inset-0  bg-opacity-20 backdrop-blur-md border border-white border-opacity-30 rounded-xl shadow-lg flex items-center justify-center z-50">

                    <div className="bg-white rounded-xl shadow-xl  w-[85%] max-w-md relative">
                        {/* Close Button for EditModal */}
                      

                        {/* TodoForm for adding or editing task */}
                        <TodoForm
                            onAdd={handleSave}
                            onClose={onClose}
                            todo={todo} // Pass todo if editing (to pre-fill the form)
                        />
                    </div>
                </div>
            )}
        </>
    );
};

export default EditModal;
