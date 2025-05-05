import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { toast } from "react-toastify"; // Ensure you have this for toast notification

const TodoForm = ({ onAdd, onClose, todo }) => {
    const [title, setTitle] = useState(todo?.title || ""); // Pre-fill title if todo exists
    const [desc, setDesc] = useState(todo?.description || ""); // Pre-fill description if todo exists
    const [date, setDate] = useState(todo?.due_date || ""); // Pre-fill date if todo exists
    const [validationError, setValidationError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [disabled, setDisabled] = useState(true);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!title || !date) return; // Ensure title and date are present
        onAdd(title, desc, date);
        setTitle("");
        setDesc("");
        setDate("");
    };

    const validateTitle = (input) => {
        const trimmed = input.replace(/\s/g, "");
        if (trimmed.length < 3) {
            setErrorMessage("Title must be at least 3 characters (excluding spaces).");
        } else {
            setErrorMessage(""); // Clear error if title is valid
        }
    };

    const validateDate = (selectedDate) => {
        if (!selectedDate) {
            setValidationError(true); // Set validation error if no date is selected
        } else {
            setValidationError(false); // Reset validation error if date is selected
        }
    };

    // This useEffect ensures that validationError is correctly updated when date changes
    useEffect(() => {
        validateDate(date); // Call validateDate whenever the date state changes
    }, [date]);

    // This useEffect ensures that the button will only be enabled if there are no validation errors
    useEffect(() => {
        if (title && !errorMessage && date && !validationError) {
            setDisabled(false); // Enable button if both title and date are valid
        } else {
            setDisabled(true); // Disable button if any validation fails
        }
    }, [title, errorMessage, date, validationError]); // Dependencies to re-run effect when these values change

    useEffect(() => {
        if (todo) {
            setTitle(todo.title);
            setDesc(todo.description);
            setDate(todo.due_date);
        }
    }, [todo]); // When todo changes, re-set form fields

    const handleDateFocus = (e) => {
        e.target.showPicker(); // Open date picker when focused
    };

    return (
        <div className="relative bg-white rounded-lg shadow p-6 pt-10 space-y-4">
            <h1 className={todo ? "text-center text-2xl text-indigo-500 font-bold" : "text-left -mt-6 text-xl text-indigo-500 font-semibold"}>
                {todo ? "Edit Task" : "Add New Task "}
            </h1>

            
            {/* Close Button */}
            <button
                onClick={onClose}
                type="button"
                className="absolute top-2 right-2 text-gray-500 hover:text-red-500 transition cursor-pointer "
            >
                <X size={20} />
            </button>

            {/* Form Fields */}
            <input
                type="text"
                placeholder="Title"
                value={title}
                onChange={(e) => {
                    const input = e.target.value;
                    setTitle(input);
                    validateTitle(input); // Call title validation function
                }}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errorMessage ? "border-red-500" : ""}`}
            />
            {errorMessage && (
                <p className="text-red-500 text-sm -mt-2 ">{errorMessage}</p>
            )}

            <textarea
                placeholder="Description"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                rows={3}
            
            />
            <input
                type="date"
                min={new Date().toLocaleDateString("en-CA")}
                value={date}
                onChange={(e) => {
                    const selectedDate = e.target.value;
                    setDate(selectedDate);
                }}
                onFocus={handleDateFocus} // Trigger calendar to open on focus
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 cursor-pointer"
            />

            <button
                onClick={handleSubmit}
                className="w-full py-2 rounded-lg text-white 
                bg-blue-600 hover:bg-blue-700 cursor-pointer transition
                disabled:bg-gray-400 disabled:cursor-not-allowed"
                disabled={disabled}
            >
                {todo ? "Save Changes" : "Add Task"}
            </button>
        </div>
    );
};

export default TodoForm;
