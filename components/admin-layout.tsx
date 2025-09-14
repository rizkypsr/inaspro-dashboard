"use client";

import { useState, useEffect } from "react";
import { Link } from "@heroui/link";
import { Sidebar } from "@/components/sidebar";
import { Navbar } from "@/components/navbar";
import { useAuth } from "@/lib/auth-context";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  // Removed sidebar collapse functionality
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAdmin } = useAuth();

  // Check if screen is mobile size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMobile && mobileMenuOpen) {
        const sidebar = document.getElementById('sidebar');
        if (sidebar && !sidebar.contains(event.target as Node)) {
          setMobileMenuOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobile, mobileMenuOpen]);

  const handleSidebarToggle = () => {
    if (isMobile) {
      setMobileMenuOpen(!mobileMenuOpen);
    }
    // Removed desktop collapse functionality
  };

  // Show basic layout without sidebar/header for non-authenticated users
  if (!user || !isAdmin) {
    return (
      <div className="relative flex flex-col h-screen">
        <main className="container mx-auto max-w-7xl px-6 flex-grow">
          {children}
        </main>
      </div>
    );
  }

  // Admin dashboard layout with sidebar
  return (
    <div className="flex h-screen bg-background relative">
      {/* Mobile Overlay */}
      {isMobile && mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div 
        id="sidebar"
        className={`
          flex-shrink-0
          ${isMobile ? 'fixed' : 'relative'} 
          ${isMobile && !mobileMenuOpen ? '-translate-x-full' : 'translate-x-0'}
          ${isMobile ? 'z-50' : 'z-10'}
          transition-transform duration-300 ease-in-out
          lg:translate-x-0
        `}
      >
        <Sidebar 
           isCollapsed={false} 
           onToggle={handleSidebarToggle}
           isMobile={isMobile}
         />
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Top Navbar */}
        <div className="flex-shrink-0">
          <Navbar 
            onMenuToggle={handleSidebarToggle}
            showMenuButton={isMobile}
          />
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-x-auto overflow-y-auto p-4 lg:p-6 bg-default-50">
          <div className="max-w-none w-full">
            {children}
          </div>
        </main>

        {/* Footer */}
        <footer className="flex-shrink-0 border-t border-divider bg-background">
          <div className="flex items-center justify-center py-3">
            <Link
              isExternal
              className="flex items-center gap-1 text-current"
              href="https://heroui.com?utm_source=next-app-template"
              title="heroui.com homepage"
            >
              <span className="text-default-600">Powered by</span>
              <p className="text-primary">HeroUI</p>
            </Link>
          </div>
        </footer>
      </div>
    </div>
  );
};