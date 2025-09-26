import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Project } from '@/types/project';
import { MapPin, AlertTriangle, Coins, Leaf, Droplets, Zap, Building2 } from 'lucide-react';

interface ProjectCardProps {
  project: Project;
  onClick: () => void;
}

const getRiskColor = (score: number) => {
  if (score <= 30) return 'text-accent';
  if (score <= 60) return 'text-warning';
  return 'text-destructive';
};

const getRiskBg = (score: number) => {
  if (score <= 30) return 'bg-accent/10 border-accent/20';
  if (score <= 60) return 'bg-warning/10 border-warning/20';
  return 'bg-destructive/10 border-destructive/20';
};

const getSDGIcon = (sdg: string) => {
  if (sdg.includes('Life on Land')) return <Leaf className="h-3 w-3" />;
  if (sdg.includes('Clean Water')) return <Droplets className="h-3 w-3" />;
  if (sdg.includes('Clean Energy')) return <Zap className="h-3 w-3" />;
  if (sdg.includes('Climate Action')) return <Leaf className="h-3 w-3" />;
  if (sdg.includes('Life Below Water')) return <Droplets className="h-3 w-3" />;
  if (sdg.includes('Decent Work')) return <Building2 className="h-3 w-3" />;
  if (sdg.includes('Innovation')) return <Zap className="h-3 w-3" />;
  return <Leaf className="h-3 w-3" />;
};

export function ProjectCard({ project, onClick }: ProjectCardProps) {
  const topSDGs = project.sdgs.slice(0, 3);

  return (
    <Card
      className="cursor-pointer hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-card to-muted/20 border-border/50 hover:border-accent/30 group"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-foreground group-hover:text-accent transition-colors">
          {project.name}
        </CardTitle>
        <div className="flex items-center gap-1 text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span className="text-sm">{project.country}, {project.region}</span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Risk Score */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-foreground">Risk Score</span>
          </div>
          <div className={`px-3 py-1 rounded-full border ${getRiskBg(project.riskScore)}`}>
            <span className={`text-sm font-semibold ${getRiskColor(project.riskScore)}`}>
              {project.riskScore}
            </span>
          </div>
        </div>

        {/* Credits Remaining */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Coins className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-foreground">Credits Available</span>
          </div>
          <span className="text-sm font-semibold text-accent">
            {project.creditsRemaining.toLocaleString()}
          </span>
        </div>

        {/* SDG Tags */}
        <div className="space-y-2">
          <span className="text-xs text-muted-foreground uppercase tracking-wider">Top SDGs</span>
          <div className="flex flex-wrap gap-1">
            {topSDGs.map((sdg, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="text-xs px-2 py-1 bg-secondary/50 border-border/50 text-secondary-foreground hover:bg-accent/20 transition-colors"
              >
                <span className="mr-1 text-accent">
                  {getSDGIcon(sdg)}
                </span>
                {sdg.split(':')[0]}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}