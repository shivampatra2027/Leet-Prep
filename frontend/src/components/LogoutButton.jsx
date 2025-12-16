import Button from "./button";

export function LogoutButton({ variant = "ghost", className }){
    const handleLogout=()=>{
        localStorage.removeItem("authtoken");
        window.location.href="/login";
    }
}


return (
    <Button variant={variant} className={className} onClick={handleLogout}>Logout</Button>
)