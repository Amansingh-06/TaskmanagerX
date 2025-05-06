import { useState } from "react";
import { supabase } from "../supabaseClient";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const useLoginFlow = () => {
    const [step, setStep] = useState("mobile");
    const [mobile, setMobile] = useState("");
    const [name, setName] = useState("");
    const [otp, setOtp] = useState("");
    const [userExists, setUserExists] = useState(false);
    const [isSendingOtp, setIsSendingOtp] = useState(false);

    const formattedPhone = mobile.startsWith("+91") ? mobile : "+91" + mobile;
    const navigate = useNavigate();

    const handleMobileSubmit = async () => {
        setIsSendingOtp(true);

        try {
            const { data, error } = await supabase
                .from("users")
                .select("*")
                .eq("phone", formattedPhone)
                .single();

            console.log("🔍 User check result:", { data, error });

            if (error || !data) {
                setUserExists(false);
                setStep("name");
            } else {
                console.log("✅ User found, sending OTP...");
                setUserExists(true);
                if (otpSent) {
                    console.log("➡ Moving to OTP step");
                    setStep("otp");
                }
            }
        } catch (err) {
            toast.error("Something went wrong while checking user.");
        } finally {
            setIsSendingOtp(false);
        }
    };

    const handleNameSubmit = async () => {
        console.log("➡ handleNameSubmit called with name:", name);
        try {
            const { error } = await supabase
                .from("users")
                .insert([{ phone: formattedPhone, name }]);

            if (error) {
                toast.error("Failed to register name ❌");
            } else {
                toast.success("Name added successfully ✅");
                const otpSent = await sendOtp();
                if (otpSent) {
                    console.log("➡ Moving to OTP step");
                    setStep("otp");
                }
            }
        } catch (err) {
            console.error("❌ Unexpected error in handleNameSubmit:", err);
            toast.error("Unexpected error");
        }
    };

    const sendOtp = async () => {
        const toastId = toast.loading("Sending OTP...");

        try {
            const { data, error } = await supabase.auth.signInWithOtp({ phone: formattedPhone });


            if (error) {
                toast.error(error.message || "Failed to send OTP ❌");
                return false;
            }

            toast.success("OTP Sent ✅", { id: toastId });
            return true;
        } catch (error) {
            toast.error("Unexpected error occurred ❌");
            return false;
        }
    };

    const handleOtpSubmit = async () => {
        try {
            const { data, error } = await toast.promise(
                supabase.auth.verifyOtp({
                    phone: formattedPhone,
                    token: otp,
                    type: "sms",
                }),
                {
                    loading: "Verifying OTP...",
                    success: "OTP Verified ✅",
                    error: "Invalid OTP ❌",
                }
            );


            if (data?.user && !userExists) {
                console.log("ℹ New user, checking again in DB...");
                const { data: userCheck, error: checkError } = await supabase
                    .from("users")
                    .select("*")
                    .eq("phone", formattedPhone)
                    .single();


                if (checkError || !userCheck) {
                    const { error: insertError } = await supabase
                        .from("users")
                        .insert([{ phone: formattedPhone, name }]);

                    if (insertError) {
                        console.error("❌ Failed to insert user after OTP:", insertError);
                        toast.error("Failed to add user to database ❌");
                    } else {
                        console.log("✅ User inserted post OTP");
                        toast.success("User added to database ✅");
                    }
                }
            }

            navigate("/", { replace: true });
        } catch (err) {
            console.error("❌ Unexpected OTP error:", err);
            toast.error("Unexpected OTP verification error");
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
