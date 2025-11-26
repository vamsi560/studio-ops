'use client';
import {
  LayoutDashboard,
  Users,
  GitCompareArrows,
  AreaChart,
} from 'lucide-react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarInset,
  SidebarFooter
} from '@/components/ui/sidebar';
import { Logo } from '@/components/logo';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { usePathname } from 'next/navigation';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const userAvatar = PlaceHolderImages.find(img => img.id === 'user-avatar');

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="p-4">
          <div className="flex items-center gap-3">
             <Logo className="size-8 text-primary" />
             <h1 className="text-xl font-semibold text-primary">BenchBoard</h1>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname === '/'}
                tooltip="Dashboard"
                as={Link}
                href="/"
              >
                <>
                  <LayoutDashboard />
                  <span>Dashboard</span>
                </>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname === '/resource-mapping'}
                tooltip="Resource Mapping"
                as={Link}
                href="/resource-mapping"
              >
                <>
                  <GitCompareArrows />
                  <span>Resource Mapping</span>
                </>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname === '/rrf-bench-dashboard'}
                tooltip="RRF vs Bench"
                as={Link}
                href="/rrf-bench-dashboard"
              >
                <>
                  <AreaChart />
                  <span>RRF vs Bench</span>
                </>
              </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <SidebarMenuButton
                href="#"
                isActive={pathname === '/resources'}
                tooltip="Resources"
                isDisabled
              >
                
                  <Users />
                  <span>Resources</span>
                
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="p-4">
           <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
                {userAvatar && <AvatarImage src={userAvatar.imageUrl} alt="User Avatar" />}
                <AvatarFallback>AD</AvatarFallback>
            </Avatar>
            <div>
                <p className="text-sm font-medium">Admin User</p>
                <p className="text-xs text-muted-foreground">admin@example.com</p>
            </div>
           </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
