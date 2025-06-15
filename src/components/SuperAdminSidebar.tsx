
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { Users, Building2, UserPlus, BarChart3, LogOut, Settings, Crown } from 'lucide-react';
import FuelSyncLogo from './FuelSyncLogo';

const superAdminItems = [
  {
    title: "Users",
    url: "/superadmin/users",
    icon: Users,
    description: "Manage all platform users"
  },
  {
    title: "Stations", 
    url: "/superadmin/stations",
    icon: Building2,
    description: "View and manage all stations"
  },
  {
    title: "Plans",
    url: "/superadmin/plans",
    icon: Settings,
    description: "Manage subscription plans"
  },
  {
    title: "Create Owner",
    url: "/superadmin/create-owner",
    icon: UserPlus,
    description: "Onboard new station owners"
  },
  {
    title: "Analytics",
    url: "/superadmin/analytics", 
    icon: BarChart3,
    description: "Platform-wide analytics"
  },
];

export function SuperAdminSidebar() {
  const location = useLocation();
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <Sidebar className="w-64">
      <SidebarHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FuelSyncLogo className="h-8" />
            <Crown className="w-5 h-5 text-amber-500" />
          </div>
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          Platform Administration
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Super Admin</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {superAdminItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild
                    isActive={location.pathname === item.url}
                    className="flex flex-col items-start h-auto py-3"
                  >
                    <Link to={item.url}>
                      <div className="flex items-center gap-2 w-full">
                        <item.icon className="w-4 h-4" />
                        <span className="font-medium">{item.title}</span>
                      </div>
                      <span className="text-xs text-muted-foreground mt-1">
                        {item.description}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="p-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleLogout}
            className="w-full justify-start"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
        <p className="text-xs text-muted-foreground px-2 pb-2">
          FuelSync Platform Admin
        </p>
      </SidebarFooter>
    </Sidebar>
  );
}
