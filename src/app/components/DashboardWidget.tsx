import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { TrendingUp, TrendingDown, Minus, LucideIcon } from 'lucide-react';

interface DashboardWidgetProps {
  title: string;
  value: number | string;
  description?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    label: string;
  };
  color?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  onClick?: () => void;
}

export function DashboardWidget({
  title,
  value,
  description,
  icon: Icon,
  trend,
  color = 'default',
  onClick,
}: DashboardWidgetProps) {
  const colorClasses = {
    default: 'text-primary',
    success: 'text-green-600',
    warning: 'text-orange-600',
    danger: 'text-red-600',
    info: 'text-blue-600',
  };

  const bgClasses = {
    default: 'bg-primary/10',
    success: 'bg-green-50',
    warning: 'bg-orange-50',
    danger: 'bg-red-50',
    info: 'bg-blue-50',
  };

  const getTrendIcon = () => {
    if (!trend) return null;
    if (trend.value > 0) return <TrendingUp className="w-4 h-4" />;
    if (trend.value < 0) return <TrendingDown className="w-4 h-4" />;
    return <Minus className="w-4 h-4" />;
  };

  const getTrendColor = () => {
    if (!trend) return '';
    if (trend.value > 0) return 'text-green-600 bg-green-50';
    if (trend.value < 0) return 'text-red-600 bg-red-50';
    return 'text-gray-600 bg-gray-50';
  };

  return (
    <Card
      className={`transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:shadow-lg hover:border-primary' : ''
      }`}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardDescription className="text-sm">{title}</CardDescription>
          {Icon && (
            <div className={`p-2 rounded-lg ${bgClasses[color]}`}>
              <Icon className={`w-5 h-5 ${colorClasses[color]}`} />
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <CardTitle className={`text-3xl font-bold ${colorClasses[color]}`}>
            {value}
          </CardTitle>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
          {trend && (
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className={`text-xs ${getTrendColor()}`}>
                <span className="flex items-center gap-1">
                  {getTrendIcon()}
                  {Math.abs(trend.value)}%
                </span>
              </Badge>
              <span className="text-xs text-muted-foreground">{trend.label}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface QuickStatsProps {
  stats: Array<{
    title: string;
    value: number | string;
    description?: string;
    icon?: LucideIcon;
    trend?: { value: number; label: string };
    color?: 'default' | 'success' | 'warning' | 'danger' | 'info';
    onClick?: () => void;
  }>;
  columns?: 2 | 3 | 4;
}

export function QuickStats({ stats, columns = 4 }: QuickStatsProps) {
  const gridCols = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={`grid ${gridCols[columns]} gap-4`}>
      {stats.map((stat, index) => (
        <DashboardWidget key={index} {...stat} />
      ))}
    </div>
  );
}
