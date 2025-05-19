import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Navigation } from "lucide-react";
import { useAuth } from "../context/authContext";
import { useNavigate } from "react-router-dom";
import { getCurrentLocation } from "../utils/getCurrentLocation";

const NavBar = () => {
    const [coords, setCoords] = useState({ lat: null, lng: null, accuracy: null });
    const [loading, setLoading] = useState(false);
    const [address, setAddress] = useState(null);
    const [showAddress, setShowAddress] = useState(false); // 👈 NEW: show/hide toggle

    const { session, userData, handleLogout } = useAuth();
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

    const handleShare = async () => {
        const shareData = {
            title: "Join TaskmanagerX",
            url: `${window.location.origin}/login?ref=${session?.user?.id}`,
        };
        if (navigator.share) {
            navigator
                .share(shareData)
                .then(() => console.log("Referral link shared"))
                .catch((error) => console.error("Error sharing", error));
        } else {
            navigator.clipboard.writeText(shareData.url);
            alert("Share not supported, link copied to clipboard");
        }
    };

    const handleGetLocation = async () => {
        setLoading(true);
        try {
            const location = await getCurrentLocation();
            setCoords({ lat: location.lat, lng: location.lng, accuracy: location.accuracy });

            const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
            const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${location.lat},${location.lng}&key=${apiKey}`;

            const res = await fetch(url);
            const data = await res.json();

            if (data.status === "OK" && data.results.length > 0) {
                const address = data.results[0].formatted_address;
                setAddress(address);
                setShowAddress(true); // 👈 Show when fetched
            } else {
                console.warn("Unable to get address from coordinates.");
            }

        } catch (error) {
            alert(error.message);
            console.error(error);
        } finally {
            setLoading(false);
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
                                onClick={handleGetLocation}
                                className="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 shadow-md disabled:opacity-50"
                            >
                                <Navigation size={24} />
                            </button>
                        )}
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
                                        onClick={handleGetLocation}
                                        className="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 shadow-md disabled:opacity-50 flex justify-center items-center"
                                    >
                                        <Navigation size={24} />
                                    </button>
                                )}
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
                <div className="block md:hidden mt-[70px] text-center text-blue-700 font-semibold text-lg">
                    Welcome {capitalize(userData?.name)} 👋
                </div>
            )}

            {/* 📍 Address Section */}
            <AnimatePresence>
                {(loading || (showAddress && address)) && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        className={` mt-0 md:mt-20 w-full z-40 px-4 md:px-6 border`}
                    >
                        <div className="max-w-7xl mx-auto flex justify-center md:justify-center">
                            <div className="bg-white bg-opacity-80 rounded-md px-3 py-2 shadow-md text-sm text-gray-800 flex items-center gap-2 relative">
                                {loading ? (
                                    <span className="animate-pulse">📍 Fetching location...</span>
                                ) : (
                                    <>
                                        <span>📍 <strong>Your Address:</strong> {address}</span>
                                        <button
                                            onClick={() => setShowAddress(false)}
                                            className="ml-2 text-gray-500 hover:text-red-500"
                                        >
                                            <X size={16} />
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NavBar;
