import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar.jsx"
import { AppSidebar } from "@/components/ui/app-sidebar.jsx"

export default function Layout({ children }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main>
        <SidebarTrigger />
        {children}
      </main>
    </SidebarProvider>
  )
}