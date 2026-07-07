import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from "@/components/ui/card";

interface AppCardProps {
    title: string;
    description?: string;
    icon?: React.ReactNode;
    children: React.ReactNode;
    action?: React.ReactNode;
}

export function AppCard({
    title,
    description,
    icon,
    children,
    action,
}: AppCardProps) {
    return (
      <Card className="rounded-lg bg-card p-6 shadow border-0 gap-0">
        <CardHeader className="relative flex items-center justify-between mb-4 p-0">
          <div className="flex items-center space-x-2">
            {icon && <div className="text-primary">{icon}</div>}
            <CardTitle className="text-xl text-foreground">{title}</CardTitle>
          </div>

          {action && (
            <div className="relative right">{action}</div>
          )}
        </CardHeader>

        {description && (
          <CardDescription className="text-muted-foreground text-sm mb-4">
            {description}
          </CardDescription>
        )}

        <CardContent className="p-0">{children}</CardContent>
      </Card>
    );
}
