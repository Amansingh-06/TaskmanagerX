import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useLoginFlow from "../hooks/useLoginFlow";
import { Toaster } from "react-hot-toast";
import OTPInput from "react-otp-input";

const LoginFlow = () => {
    const {
        step,
        mobile,
        name,
        otp,
        isSendingOtp,
        setMobile,
        setName,
        setOtp,
        handleMobileSubmit,
        handleNameSubmit,
        handleOtpSubmit
    } = useLoginFlow();

    const [mobileError, setMobileError] = useState("");
    const [nameError, setNameError] = useState("");
    const [otpError, setOtpError] = useState("");
    const [otpSent, setOtpSent] = useState(false);

    const otpRefs = Array.from({ length: 6 }, () => useRef(null));

    // OTP Autofill with AbortController and cleanup
    useEffect(() => {
        let controller;

        const attemptOtpAutofill = async () => {
            if ("OTPCredential" in window && step === "otp") {
                try {
                    controller = new AbortController();
                    const timeout = setTimeout(() => controller.abort(), 60000);

                    const content = await navigator.credentials.get({
                        otp: { transport: ["sms"] },
                        signal: controller.signal,
                    });

                    clearTimeout(timeout);

                    if (content && content.code) {
                        const numericCode = content.code.replace(/\D/g, "").slice(0, 6);
                        setOtp(numericCode);

                        setTimeout(() => {
                            const lastIndex = numericCode.length - 1;
                            if (otpRefs[lastIndex]?.current) {
                                otpRefs[lastIndex].current.focus();
                            }
                        }, 100);
                    }
                } catch (error) {
                    if (error.name !== "AbortError") {
                        console.error("OTP Autofill Error:", error);
                    }
                }
            }
        };

        attemptOtpAutofill();

        return () => {
            if (controller) {
                controller.abort(); // ✅ Clean up OTP listener
            }
        };
    }, [step]);

    const animation = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 },
        transition: { duration: 0.4, ease: "easeInOut" },
    };

    const isValidMobile = (phone) => /^[6-9]\d{9}$/.test(phone);
    const isValidName = (n) => /^[A-Za-z ]{3,}$/.test(n.trim());
    const isValidOtp = (code) => /^\d{6}$/.test(code);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-blue-200 via-purple-200 to-pink-200 p-6">
            <Toaster position="top-center" reverseOrder={false} />
            <div className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-md">
                <h2 className="text-3xl font-semibold text-center mb-8 text-blue-800">
                    Welcome to TaskManagerX
                </h2>

                <AnimatePresence mode="wait">
                    {step === "mobile" && (
                        <motion.div key="mobile" {...animation} className="space-y-4">
                            <input
                                type="tel"
                                value={mobile}
                                onChange={(e) => {
                                    const onlyNumbers = e.target.value.replace(/\D/g, "");
                                    setMobile(onlyNumbers);
                                    setMobileError("");
                                }}
                                placeholder="Enter Mobile Number"
                                className="w-full border-2 border-gray-300 p-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                            />
                            {mobile && !isValidMobile(mobile) && (
                                <p className="text-red-600 text-sm">Please enter a valid mobile number.</p>
                            )}
                            <button
                                onClick={async () => {
                                    if (!isValidMobile(mobile)) {
                                        setMobileError("Invalid mobile number.");
                                        return;
                                    }
                                    const result = await handleMobileSubmit();
                                    if (result !== false) setOtpSent(true);
                                }}
                                disabled={!isValidMobile(mobile) || isSendingOtp}
                                className={`w-full py-3 rounded-lg transition ${isValidMobile(mobile) && !isSendingOtp
                                        ? "bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
                                        : "bg-gray-300 text-gray-600 cursor-not-allowed"
                                    }`}
                            >
                                {isSendingOtp ? "Sending..." : "Send OTP"}
                            </button>
                        </motion.div>
                    )}

                    {step === "otp" && (
                        <motion.div key="otp" {...animation} className="space-y-4">
                            <OTPInput
                                value={otp}
                                onChange={(value) => {
                                    const numericOtp = value.replace(/\D/g, "");
                                    setOtp(numericOtp);
                                }}
                                numInputs={6}
                                isInputNum
                                shouldAutoFocus
                                containerStyle={{ display: 'flex', justifyContent: 'center', gap: '10px' }}
                                inputStyle={{
                                    width: '30px',
                                    height: '50px',
                                    textAlign: 'center',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '0.5rem',
                                    outline: 'none',
                                    backgroundColor: '#ffffff',
                                    color: '#374151',
                                    fontSize: '1rem',
                                }}
                                renderInput={(props, index) => (
                                    <input
                                        {...props}
                                        ref={otpRefs[index]}
                                    />
                                )}
                                inputProps={{
                                    inputMode: 'numeric',
                                    autoComplete: 'one-time-code',
                                }}
                            />
                            {otp && !isValidOtp(otp) && (
                                <p className="text-red-600 text-sm">OTP must be 6 digits.</p>
                            )}
                            <button
                                onClick={handleOtpSubmit}
                                disabled={!isValidOtp(otp)}
                                className={`w-full py-3 rounded-lg transition ${isValidOtp(otp)
                                        ? "bg-purple-600 text-white hover:bg-purple-700 cursor-pointer"
                                        : "bg-gray-300 text-gray-600 cursor-not-allowed"
                                    }`}
                            >
                                Submit OTP
                            </button>
                        </motion.div>
                    )}

                    {step === "name" && (
                        <motion.div key="name" {...animation} className="space-y-4">
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => {
                                    const onlyLetters = e.target.value.replace(/[^A-Za-z ]/g, "");
                                    setName(onlyLetters);
                                    setNameError("");
                                }}
                                placeholder="Enter Your Name"
                                className="w-full border-2 border-gray-300 p-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                            />
                            {name && !isValidName(name) && (
                                <p className="text-red-600 text-sm">
                                    Name should be at least 3 characters and contain only letters.
                                </p>
                            )}
                            <button
                                onClick={handleNameSubmit}
                                disabled={!isValidName(name)}
                                className={`w-full py-3 rounded-lg transition ${isValidName(name)
                                        ? "bg-green-600 text-white hover:bg-green-700 cursor-pointer"
                                        : "bg-gray-300 text-gray-600 cursor-not-allowed"
                                    }`}
                            >
                                Continue
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default LoginFlow;
