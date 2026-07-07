// SidebarContent.tsx
import { Link, useLocation } from "react-router-dom";
import { User, Settings, LogOut } from "lucide-react";
import type { User as UserType } from "@/types/User";
import { type LucideIcon } from "lucide-react";

type NavItem = {
  path: string;
  icon: LucideIcon;
  label: string;
  disabled: boolean;
};

type SidebarProps = {
  user: UserType | null;
  navItems: NavItem[];
  handleLogout: () => void;
  onNavigate?: () => void; // para fechar drawer no mobile
};

export function Sidebar({
  user,
  navItems,
  handleLogout,
  onNavigate,
}: SidebarProps) {
  const location = useLocation();

  return (
    <div className="flex flex-col h-full bg-sidebar text-sidebar-foreground">

      {/* Brand */}
      <div className="px-4 pt-5 pb-4">
        <span className="text-xl font-extrabold tracking-tight text-gradient-brand">
          Brickei
        </span>
      </div>

      {/* User Info */}
      <div className="mx-4 mb-4 flex items-center gap-3 rounded-xl border border-sidebar-border bg-sidebar-accent/40 p-3">
        <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center shrink-0">
          <User className="w-5 h-5 text-primary" />
        </div>
        <div className="min-w-0">
          <div className="text-sm font-medium truncate">{user?.nome}</div>
          <div className="text-xs text-sidebar-foreground/60 capitalize">
            {user?.tipo}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          if (!item.disabled) {
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onNavigate}
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-sidebar-accent text-primary"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          }

          return null;
        })}
      </nav>

      {/* Profile & Logout */}
      <div className="p-4 border-t border-sidebar-border space-y-1 shrink-0">
        {user?.tipo === "loja" && (
          <Link
          to="/loja/perfil"
          onClick={onNavigate}
          className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              location.pathname === "/loja/perfil"
              ? "bg-sidebar-accent text-primary"
              : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
            }`}
            >
            <Settings className="w-5 h-5" />
            <span>Profile</span>
          </Link>
        )}

        <button
          onClick={() => {
            handleLogout();
            onNavigate?.();
          }}
          className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 w-full transition-colors"
          >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
