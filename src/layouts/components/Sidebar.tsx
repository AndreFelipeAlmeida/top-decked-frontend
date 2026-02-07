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
    <div className="flex flex-col h-full bg-white">

      {/* User Info */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <div className="text-sm text-gray-900">{user?.nome}</div>
            <div className="text-xs text-gray-500 capitalize">
              {user?.tipo}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          if (!item.disabled) {
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onNavigate}
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? "bg-purple-50 text-purple-600"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm">{item.label}</span>
              </Link>
            );
          }

          return null;
        })}

        {/* Profile & Logout */}
        <div className="p-4 border-t border-gray-200 space-y-1 shrink-0">
          {user?.tipo === "loja" && (
            <Link
            to="/loja/perfil"
            onClick={onNavigate}
            className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                location.pathname === "/loja/perfil"
                ? "bg-purple-50 text-purple-600"
                : "text-gray-700 hover:bg-gray-100"
              }`}
              >
              <Settings className="w-5 h-5" />
              <span className="text-sm">Profile</span>
            </Link>
          )}

          <button
            onClick={() => {
              handleLogout();
              onNavigate?.();
            }}
            className="flex items-center space-x-3 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 w-full transition-colors"
            >
            <LogOut className="w-5 h-5" />
            <span className="text-sm">Logout</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
