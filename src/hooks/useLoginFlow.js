import { useState } from "react";
import { supabase } from "../supabaseClient";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { registerNewUser } from "../utils/registerNewUser";

const useLoginFlow = () => {
    const [step, setStep] = useState("mobile");
    const [mobile, setMobile] = useState("");
    const [name, setName] = useState("");
    const [otp, setOtp] = useState("");
    const [isSendingOtp, setIsSendingOtp] = useState(false);

    const formattedPhone = mobile.startsWith("+91") ? mobile : "+91" + mobile;
    const navigate = useNavigate();

    // 📲 Handle Mobile Submit
    const handleMobileSubmit = async () => {
        setIsSendingOtp(true);

        try {
            const otpSent = await sendOtp();
            if (otpSent) {
                setStep("otp");
            } else {
                toast.error("Sending OTP failed ❌");
            }
        } catch (err) {
            toast.error("Something went wrong while sending OTP.");
            console.log(err);
        } finally {
            setIsSendingOtp(false);
        }
    };

    // 🧾 Handle Name Submit (if name was missing after OTP)
    const handleNameSubmit = async () => {
        try {
            const currentUser = await supabase.auth.getUser();
            console.log(currentUser)
            const userId = currentUser?.data?.user?.id;

            if (!userId) {
                toast.error("User not logged in ❌");
                return;
            }

            await registerNewUser(userId, name, formattedPhone);
            toast.success("User registered successfully ✅");

            navigate("/", { replace: true });
        } catch (err) {
            console.error("❌ Unexpected error in handleNameSubmit:", err);
            toast.error("Unexpected error during registration ❌");
        }
    };
    

    // 🔐 Send OTP via Supabase
    const sendOtp = async () => {
        const toastId = toast.loading("Sending OTP...");

        try {
            const { data, error } = await supabase.auth.signInWithOtp({ phone: formattedPhone });

            if (error) {
                toast.error(error.message || "Failed to send OTP ❌", { id: toastId });
                return false;
            }

            toast.success("OTP Sent ✅", { id: toastId });
            return true;
        } catch (error) {
            toast.error("Unexpected error occurred ❌", { id: toastId });
            return false;
        }
    };

    // ✅ Handle OTP Submit -> Check name in DB
    const handleOtpSubmit = async () => {
        try {
            const { data, error } = await supabase.auth.verifyOtp({
                phone: formattedPhone,
                token: otp,
                type: "sms",
            });

            if (error || !data?.user) {
                toast.error("OTP is incorrect ❌");
                return;
            }

            toast.success("OTP Verified ✅");

            // Check if name already exists
            const { data: user, error: nameError } = await supabase
                .from("users")
                .select("name")
                .eq("phone", formattedPhone)
                .single();

            if (nameError || !user?.name) {
                setStep("name");
                console.log("User name fetch error or missing:", nameError);
            } else {
                navigate("/", { replace: true });
            }

        } catch (err) {
            console.error("❌ Unexpected OTP error:", err);
            toast.error("Something went wrong during OTP verification ❌");
        }
    };

    return {
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
        handleOtpSubmit,
    };
};

export default useLoginFlow;
