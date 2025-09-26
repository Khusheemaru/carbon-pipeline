import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

export function MetricCard({ title, value, subtitle, icon: Icon, variant = 'default' }: MetricCardProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
        return 'border-accent/30 bg-gradient-to-br from-accent/5 to-accent/10';
      case 'warning':
        return 'border-warning/30 bg-gradient-to-br from-warning/5 to-warning/10';
      case 'danger':
        return 'border-destructive/30 bg-gradient-to-br from-destructive/5 to-destructive/10';
      default:
        return 'border-trust/30 bg-gradient-to-br from-trust/5 to-trust/10';
    }
  };

  const getIconColor = () => {
    switch (variant) {
      case 'success':
        return 'text-accent';
      case 'warning':
        return 'text-warning';
      case 'danger':
        return 'text-destructive';
      default:
        return 'text-trust';
    }
  };

  return (
    <Card className={`border ${getVariantStyles()} shadow-sm hover:shadow-md transition-shadow`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground font-medium">{title}</p>
            <p className="text-2xl font-bold text-foreground">{value}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
          <Icon className={`h-8 w-8 ${getIconColor()}`} />
        </div>
      </CardContent>
    </Card>
  );
}