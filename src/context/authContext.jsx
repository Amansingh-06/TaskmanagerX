import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import toast from "react-hot-toast";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [mobile, setMobile] = useState(null);
    const [userData, setUserData] = useState(null);
    const [session, setSession] = useState(null);
    const [loadingAuth, setLoadingAuth] = useState(true);

    useEffect(() => {
        const getSessionData = async () => {
            setLoadingAuth(true);
            const {
                data: { session },
            } = await supabase.auth.getSession();

            setSession(session);
            const phone = session?.user?.phone;

            if (phone) {
                setMobile(phone);
                fetchUserFromTable(phone);
                subscribeToUserUpdates(phone);
            }

            setLoadingAuth(false);
        };

        getSessionData();

        const { data: listener } = supabase.auth.onAuthStateChange(
            async (_, session) => {
                setSession(session);
                setLoadingAuth(true);

                const phone = session?.user?.phone;

                if (phone) {
                    setMobile(phone);
                    fetchUserFromTable(phone);
                    subscribeToUserUpdates(phone);
                } else {
                    setMobile(null);
                    setUserData(null);
                }

                setLoadingAuth(false);
            }
        );

        return () => {
            listener?.subscription?.unsubscribe();
            supabase.removeAllChannels();
        };
    }, []);

    const fetchUserFromTable = async (phone) => {
        const { data, error } = await supabase
            .from("users")
            .select("*")
            .eq("phone", `+${phone}`)
            .maybeSingle();

        if (data) {
            setUserData(data);
        } else {
            console.warn("User not found or fetch error:", error?.message);
        }
    };

    // ✅ Realtime: Listen to updates on the `users` table for this phone number
    const subscribeToUserUpdates = (phone) => {
        const channel = supabase
            .channel("realtime-user")
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "users",
                    filter: `phone=eq.+${phone}`,
                },
                (payload) => {
                    console.log("🔄 User updated in real-time:", payload.new);
                    setUserData(payload.new);
                }
            )
            .subscribe();

        return () => supabase.removeChannel(channel);
    };

    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error("Error signing out:", error.message);
        } else {
            toast.success("Logged out successfully!");
            setSession(null);
            setMobile(null);
            setUserData(null);
        }
    };

    return (
        <AuthContext.Provider value={{ session, mobile, userData, handleLogout, loadingAuth }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
