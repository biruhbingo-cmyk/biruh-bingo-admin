'use client';

import React from "react"

import { useAuth } from '@/lib/auth-context';
import { useRouter, usePathname } from 'next/navigation';
import { LogOut, LayoutGrid, Users, CreditCard, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !loading && !user) {
      router.push('/login');
    }
  }, [user, loading, mounted, router]);

  // Close sidebar when route changes on mobile
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [pathname, isMobile]);

  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
    { href: '/dashboard/transactions', label: 'Transactions', icon: CreditCard },
    { href: '/dashboard/users', label: 'Users', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-sidebar border-b border-border/50 flex items-center justify-between px-4 z-50">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-foreground"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <span className="text-primary font-bold text-sm">⚡</span>
            </div>
            <div>
              <h1 className="text-sm font-bold text-sidebar-foreground">Admin</h1>
            </div>
          </div>
        </div>
        <h2 className="text-sm font-semibold text-foreground">
          {navItems.find((item) => item.href === pathname)?.label || 'Dashboard'}
        </h2>
      </div>

      {/* Sidebar Overlay (Mobile) */}
      {sidebarOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-sidebar border-r border-border/50 flex flex-col z-50 transition-transform duration-300 ${
          isMobile ? (sidebarOpen ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0'
        }`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <span className="text-primary font-bold">⚡</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-sidebar-foreground">Admin</h1>
              <p className="text-xs text-muted-foreground">Dashboard</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} onClick={() => isMobile && setSidebarOpen(false)}>
                <Button
                  variant={isActive ? 'default' : 'ghost'}
                  className={`w-full justify-start gap-3 ${
                    isActive
                      ? 'bg-primary/20 text-primary hover:bg-primary/30'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </nav>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-border/50 space-y-3">
          <div className="px-2 py-3 rounded-lg bg-secondary/50">
            <p className="text-xs text-muted-foreground">Admin Account</p>
            <p className="text-sm font-medium text-foreground truncate">
              {user.first_name} {user.last_name}
            </p>
            <p className="text-xs text-muted-foreground mt-1">ID: {user.telegram_id}</p>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full justify-start gap-2 text-destructive hover:text-destructive border-destructive/20 bg-transparent"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`min-h-screen transition-all duration-300 ${
        isMobile ? 'pt-16' : 'ml-64'
      }`}>
        {/* Top Bar (Desktop) */}
        <div className="hidden lg:flex sticky top-0 h-16 bg-background/80 backdrop-blur-sm border-b border-border/50 items-center px-8 z-40">
          <h2 className="text-lg font-semibold text-foreground">
            {navItems.find((item) => item.href === pathname)?.label || 'Dashboard'}
          </h2>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
