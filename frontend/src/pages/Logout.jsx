import {useEffect} from "react"
import {useNavigate} from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";

export default function Logout() {
    const navigate=useNavigate();
    const logout = useAuthStore((s) => s.logout);
    useEffect(()=>{
        logout();
        navigate("/login")
    },[logout, navigate])

    return null;
}
