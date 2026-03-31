import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from "@/components/ui/Card";

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
      <Card className="rounded-lg bg-white p-6 shadow border-0 gap-0">
        <CardHeader className="relative flex items-center justify-between mb-4 p-0">
          <div className="flex items-center space-x-2">
            {icon && <div className="text-purple-600">{icon}</div>}
            <CardTitle className="text-xl text-gray-900">{title}</CardTitle>
          </div>

          {action && (
            <div className="relative right">{action}</div>
          )}
        </CardHeader>

        {description && (
          <CardDescription className="text-gray-600 text-sm mb-4">
            {description}
          </CardDescription>
        )}

        <CardContent className="p-0">{children}</CardContent>
      </Card>
    );
}
