import { useState } from "react";
import { supabase } from "../supabaseClient";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import twilio from 'twilio';


const useLoginFlow = () => {
    const [step, setStep] = useState("mobile"); // mobile | name | otp
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

            if (error || !data) {
                setUserExists(false);
                setStep("name");
            } else {
                setUserExists(true);
                await sendOtp(); // Twilio OTP sending
                setStep("otp");
            }
        } catch (err) {
            toast.error("Something went wrong while checking user.");
            console.error(err);
        } finally {
            setIsSendingOtp(false);
        }
    };

    const handleNameSubmit = async () => {
        try {
            const { error } = await supabase
                .from("users")
                .insert([{ phone: formattedPhone, name }]);

            if (error) {
                console.error("Insert error:", error);
                toast.error("Failed to register name ❌");
            } else {
                toast.success("Name added successfully ✅");
                await sendOtp(); // Twilio OTP sending
                setStep("otp");
            }
        } catch (err) {
            toast.error("Unexpected error");
            console.error(err);
        }
    };

    const sendOtp = async () => {
        const toastId = toast.loading("Sending OTP...");

        // Using Twilio to send OTP via SMS
        try {
            const accountSid = process.env.REACT_APP_TWILIO_ACCOUNT_SID;
            const authToken = process.env.REACT_APP_TWILIO_AUTH_TOKEN;
            const client = twilio(accountSid, authToken);

            const otpCode = Math.floor(100000 + Math.random() * 900000); // Generate a 6-digit OTP

            const message = await client.messages.create({
                body: `Your verification code for TaskManagerX is: ${otpCode}\n@xtodomanager.vercel.app #${otpCode}`,
                from: process.env.REACT_APP_TWILIO_PHONE_NUMBER, // Use the Twilio phone number from .env
                to: formattedPhone,
            })

        console.log("OTP Sent via Twilio:", message.sid);

        // Store OTP code temporarily for comparison
        setOtp(otpCode);

        toast.success("OTP Sent ✅", { id: toastId });
        return true;
    } catch (error) {
        toast.error(error.message || "Failed to send OTP ❌", { id: toastId });
        return false;
    }
};

const handleOtpSubmit = async () => {
    try {
        if (otp !== otpCode) {
            toast.error("Invalid OTP ❌");
            return;
        }

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
                    toast.error("Failed to add user to database ❌");
                } else {
                    toast.success("User added to database ✅");
                }
            }
        }
        navigate("/");
    } catch (err) {
        console.error("Unexpected OTP error:", err);
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