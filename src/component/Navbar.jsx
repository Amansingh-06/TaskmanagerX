import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useAuth } from "../context/authContext";
import { useNavigate } from "react-router-dom";

const NavBar = () => {
    const { session, mobile, userData, handleLogout, loadingAuth } = useAuth();
    const isLoggedIn = !!session;
    const [isOpen, setIsOpen] = useState(false);
    const nav = useNavigate();

    const toggleMenu = () => setIsOpen(!isOpen);

    const capitalize = (name) => {
        if (!name) return "";
        return name.charAt(0).toUpperCase() + name.slice(1);
    };

    const welcomeAnimation = {
        initial: { opacity: 0, y: -10 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -10 },
        transition: { duration: 0.5, ease: "easeInOut" },
    };

    const handleLogin = () => {
        nav("/login");
    };

    const handlemobileLogin = () => {
        nav("/login");
        setIsOpen(false);
    };

    const handlemobileLogout = () => {
        handleLogout();
        setIsOpen(false);
    };

    // ✅ Share deep link handler
    const handleShare = async () => {
        const shareUrl = `${window.location.origin}/login?ref=${session?.user?.id}`;
        try {
            await navigator.clipboard.writeText(shareUrl);
            alert("Referral link copied to clipboard!");
        } catch (err) {
            alert("Failed to copy link.");
        }
    };

    return (
        <div>
            <nav className="bg-gradient-to-r from-white via-blue-100 to-blue-200 shadow-md md:px-6 px-3 py-3 fixed top-0 w-full z-50">
                <div className="max-w-7xl mx-auto flex items-center justify-between relative">
                    {/* Logo */}
                    <div className="text-2xl font-bold text-blue-600">TaskmanagerX</div>

                    {/* Animated Welcome */}
                    <AnimatePresence>
                        {isLoggedIn && (
                            <motion.div
                                {...welcomeAnimation}
                                className="absolute left-1/2 transform -translate-x-1/2 hidden md:block"
                            >
                                <span className="text-blue-700 font-semibold text-lg">
                                    Welcome {capitalize(userData?.name)} 👋
                                </span>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Desktop Buttons */}
                    <div className="hidden md:flex items-center gap-4">
                        {isLoggedIn && (
                            <button
                                onClick={handleShare}
                                className="bg-green-600 text-white px-4 py-2 rounded-full hover:bg-green-700 transition-all"
                            >
                                Share
                            </button>
                        )}
                        {isLoggedIn ? (
                            <button
                                onClick={handleLogout}
                                className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition-all cursor-pointer"
                            >
                                Logout
                            </button>
                        ) : (
                            <button
                                onClick={handleLogin}
                                className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition-all"
                            >
                                Login
                            </button>
                        )}
                    </div>

                    {/* Mobile Icon */}
                    <div className="md:hidden">
                        <button onClick={toggleMenu} className="text-gray-800">
                            {isOpen ? <X size={28} /> : <Menu size={28} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="md:hidden overflow-hidden bg-white shadow-inner mt-3 rounded-lg"
                        >
                            <div className="flex flex-col px-4 py-4 space-y-2">
                                {isLoggedIn && (
                                    <button
                                        onClick={handleShare}
                                        className="bg-green-600 text-white px-4 py-2 rounded-full hover:bg-green-700 transition-all"
                                    >
                                        Share
                                    </button>
                                )}
                                {isLoggedIn ? (
                                    <button
                                        onClick={handlemobileLogout}
                                        className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition-all"
                                    >
                                        Logout
                                    </button>
                                ) : (
                                    <button
                                        className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition-all"
                                        onClick={handlemobileLogin}
                                    >
                                        Login
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>

            {/* Mobile Welcome Message */}
            {isLoggedIn && (
                <div className="block md:hidden relative top-18 text-center text-blue-700 font-semibold text-lg">
                    Welcome {capitalize(userData?.name)} 👋
                </div>
            )}
        </div>
    );
};

export default NavBar;
