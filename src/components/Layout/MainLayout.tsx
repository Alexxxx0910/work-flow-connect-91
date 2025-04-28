
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { Home, Briefcase, MessageSquare, User, LogOut, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  const { currentUser, logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { name: 'Inicio', path: '/dashboard', icon: <Home className="w-5 h-5" /> },
    { name: 'Trabajos', path: '/jobs', icon: <Briefcase className="w-5 h-5" /> },
    { name: 'Mensajes', path: '/chats', icon: <MessageSquare className="w-5 h-5" /> },
    { name: 'Perfil', path: '/profile', icon: <User className="w-5 h-5" /> },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const renderNavItems = () => (
    <>
      {navItems.map((item) => (
        <Link 
          key={item.path} 
          to={item.path}
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-md transition-colors",
            isActive(item.path) 
              ? "bg-wfc-purple text-white" 
              : "hover:bg-accent"
          )}
        >
          {item.icon}
          <span>{item.name}</span>
        </Link>
      ))}
    </>
  );

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b py-3 px-4">
        <div className="container mx-auto flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="font-bold text-lg text-wfc-purple">
            WorkFlowConnect
          </Link>

          {/* Mobile Nav */}
          <div className="flex md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <Link to="/" className="font-bold text-xl text-wfc-purple block mb-6">
                  WorkFlowConnect
                </Link>
                <nav className="space-y-2">
                  {renderNavItems()}
                </nav>
              </SheetContent>
            </Sheet>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {renderNavItems()}
          </nav>

          {/* User Menu */}
          {currentUser ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={currentUser.photoURL || undefined} alt={currentUser.name} />
                    <AvatarFallback className="bg-wfc-purple-medium text-white">
                      {currentUser.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{currentUser.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {currentUser.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile">
                    <User className="mr-2 h-4 w-4" />
                    <span>Perfil</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Cerrar sesión</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" asChild>
                <Link to="/login">Iniciar sesión</Link>
              </Button>
              <Button className="bg-wfc-purple hover:bg-wfc-purple-medium" asChild>
                <Link to="/register">Registrarse</Link>
              </Button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t py-4 px-4 text-center text-sm text-muted-foreground">
        <div className="container mx-auto">
          WorkFlowConnect © {new Date().getFullYear()} - Conectando profesionales y proyectos
        </div>
      </footer>
    </div>
  );
};
