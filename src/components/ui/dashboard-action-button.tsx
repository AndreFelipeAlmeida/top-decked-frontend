import { Link } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

type DashboardActionButtonVariant = 'primary' | 'outline';

type DashboardActionButtonBaseProps = {
  icon: LucideIcon;
  label: string;
  variant?: DashboardActionButtonVariant;
  className?: string;
};

type DashboardActionButtonProps =
  | (DashboardActionButtonBaseProps & { to: string; onClick?: never })
  | (DashboardActionButtonBaseProps & { to?: never; onClick: () => void });

const variantClassNames: Record<DashboardActionButtonVariant, string> = {
  primary: 'bg-primary text-white hover:bg-primary/90',
  outline: 'bg-card border border-border text-muted-foreground hover:bg-accent',
};

// Botão de "ação rápida" usado nos dashboards da Loja e do Organizador —
// mesmo componente nos dois lugares para garantir que fiquem visualmente
// idênticos.
export function DashboardActionButton({
  icon: Icon,
  label,
  variant = 'outline',
  className,
  to,
  onClick,
}: DashboardActionButtonProps) {
  const sharedClassName = cn(
    'p-4 rounded-lg transition-colors flex items-center justify-center space-x-2 font-medium',
    variantClassNames[variant],
    className,
  );

  if (to) {
    return (
      <Link to={to} className={sharedClassName}>
        <Icon className="w-5 h-5" />
        <span>{label}</span>
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={sharedClassName}>
      <Icon className="w-5 h-5" />
      <span>{label}</span>
    </button>
  );
}
