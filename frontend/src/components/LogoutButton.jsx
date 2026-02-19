import Button from "./button";
import { authAPI, clearAccessToken } from "@/lib/api";

export function LogoutButton({ variant = "ghost", className }){
    const handleLogout=()=>{
        authAPI.logout().catch(() => {});
        clearAccessToken();
        window.location.href="/";
    }

    return (
        <Button variant={variant} className={className} onClick={handleLogout}>Logout</Button>
    )
}
//sync
