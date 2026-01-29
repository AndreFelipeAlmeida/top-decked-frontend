import { NavLink } from "react-router-dom";
import { cva } from "class-variance-authority"
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";


const navbarLink = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      active: {
        true: "bg-primary text-primary-foreground hover:bg-primary/90",
        false:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
      },
    },
    defaultVariants: {
      active: false,
    },
  },
);

type NavbarLinkProps = {
  to: string;
  icon?: LucideIcon;
  children: ReactNode;
  onClick?: () => void;

};

const NavbarLink = ({ to, icon: Icon, children, onClick }: NavbarLinkProps) => {
  return (
    <NavLink to={to} onClick={onClick}>
      {({ isActive }) => (
        <div className={navbarLink({ active: isActive })}>
          {Icon && <Icon className="h-4 w-4" />}
          <span>{children}</span>
        </div>
      )}
    </NavLink>
  );
}

export default NavbarLink
