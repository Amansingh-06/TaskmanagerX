import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { LogOut } from "lucide-react";
import toast from "react-hot-toast";
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [mobile, setMobile] = useState(null);
    const [userData, setUserData] = useState(null);
    const [session, setSession] = useState(null); // ✅ Add session state
    const [loadingAuth, setLoadingAuth] = useState(true);
    

    useEffect(() => {
        const getSessionData = async () => {
            setLoadingAuth(true); // Set loading to true while fetching session
            const {
                data: { session },
            } = await supabase.auth.getSession();

            setSession(session); // ✅ Set session

            const phone = session?.user?.phone;
            if (phone) {
                setMobile(phone);
                fetchUserFromTable(phone);
            }
            setLoadingAuth(false);
        };

        getSessionData();

        const { data: listener } = supabase.auth.onAuthStateChange(
            async (_, session) => {
                setSession(session); // ✅ Update session on auth change
setLoadingAuth(true); // Set loading to true while fetching session
                const phone = session?.user?.phone;
                if (phone) {
                    setMobile(phone);
                    fetchUserFromTable(phone);
                } else {
                    setMobile(null);
                    setUserData(null);
                }
                setLoadingAuth(false);
            }
        );

        return () => {
            listener?.subscription?.unsubscribe();
        };
    }, []);
    //logout function
    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error("Error signing out:", error.message);
        } else {
            toast.success("Logged out successfully!"); // Notify user on successful logout
            setSession(null); // Clear session on logout
            setMobile(null); // Clear mobile on logout
            setUserData(null); // Clear user data on logout
        }
    };


    const fetchUserFromTable = async (phone) => {
        setLoadingAuth(true); // Set loading to true while fetching user data
        const { data, error } = await supabase
            .from("users")
            .select("*")
            .eq("phone", `+${phone}`) // Assumes phone is already formatted
            .maybeSingle(); // ✅ safer than `.single()`

        if (data) {
            setUserData(data);
           
            
            
        } else {
            console.warn("User not found or fetch error:", error?.message);
        }
        setLoadingAuth(false);
    };
  

    return (
        <AuthContext.Provider value={{ session, mobile, userData,handleLogout,setLoadingAuth,loadingAuth }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
