import React from "react";
import { useTaskContext } from "../context/taskContext";
import { FaArrowRight } from "react-icons/fa6";
import { FaArrowLeft } from "react-icons/fa6";


function PaginationControls({ totalPages }) {
    const { currentPage, setCurrentPage } = useTaskContext();

    // Helper function to generate page numbers with ellipsis
    const generatePageNumbers = () => {
        const pages = [];
        const range = 2;  // Number of pages to show before and after current page

        if (totalPages <= 5) {
            // Show all pages if there are 5 or fewer
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Show first page and some pages around the current page
            if (currentPage <= range + 1) {
                for (let i = 1; i <= range + 2; i++) {
                    pages.push(i);
                }
                pages.push("...");
            } else if (currentPage >= totalPages - range) {
                pages.push(1, "...");
                for (let i = totalPages - range; i <= totalPages; i++) {
                    pages.push(i);
                }
            } else {
                pages.push(1, "...");
                for (let i = currentPage - range; i <= currentPage + range; i++) {
                    pages.push(i);
                }
                pages.push("...");
                pages.push(totalPages);
            }
        }
        console.log(pages, "pages"); // Debugging line to check generated pages 
        console.log(totalPages)
        return pages;
       
    };

    return (
        <div className="flex justify-center items-center mt-6 space-x-2">
            {/* Previous Button */}
            <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2 px-4 rounded-l-lg disabled:opacity-50 transition-all duration-300 shadow-md"
            >
               < FaArrowLeft size={20} />
            </button>

            {/* Page Numbers */}
            <div className="flex gap-2">
                {generatePageNumbers().map((page, index) => (
                    <button
                        key={index}
                        onClick={() => page !== "..." && setCurrentPage(page)}
                        className={`w-8 h-8 flex items-center justify-center rounded-full font-semibold transition-all duration-300
                            ${page === currentPage
                                ? "bg-indigo-600 text-white"
                                : "bg-gray-200 text-gray-800 hover:bg-indigo-500 hover:text-white"
                            }`}
                        disabled={page === "..."}>
                        {page}
                    </button>
                ))}
            </div>

            {/* Next Button */}
            <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
                className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2 px-4 rounded-r-lg disabled:opacity-50 transition-all duration-300 shadow-md"
            >
                <FaArrowRight size={20} />
            </button>
        </div>
    );
}

export default PaginationControls;
