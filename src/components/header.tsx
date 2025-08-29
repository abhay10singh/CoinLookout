'use client';
import { Bitcoin } from 'lucide-react'; // Example icon
import ThemeToggleButton from "@/components/ui/theme-toggle-button"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from './app-sidebar';
import { useStateToggleStore } from '@/store/store';

export function Header() {  
  const ChangeToggle = useStateToggleStore(s => s.ChangeToggle)
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
       <SidebarProvider>
        <div className="mr-4 flex items-center">
          <AppSidebar/>
          <SidebarTrigger onClick={ChangeToggle}/>
          <Bitcoin className="h-6 w-6 mr-2 text-primary" />
          <span className="text-lg font-bold">CoinLookout</span>
        </div>
        </SidebarProvider>
        <div className="flex flex-1 items-center justify-end space-x-2">
          <ThemeToggleButton variant='gif' url='https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExMnNvamE3NW95ZWx4YWJiejNvcjFlbXZlcWtvc2wweWozM3M2ZDRpbyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/4UThf83HUEPkvScAQ1/giphy.gif' />
        </div>
      </div>
    </header>
  );
}
