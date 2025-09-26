import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, Activity, Coins, Leaf, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MetricCard } from '@/components/MetricCard';
import { mockProjects } from '@/data/mockData';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const project = mockProjects.find(p => p.id === id);

  if (!project) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Project Not Found</h1>
          <Button onClick={() => navigate('/')} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const getRiskVariant = (score: number) => {
    if (score <= 30) return 'success';
    if (score <= 60) return 'warning';
    return 'danger';
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <Button
            onClick={() => navigate('/')}
            variant="ghost"
            className="mb-4 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground">{project.name}</h1>
            <p className="text-lg text-muted-foreground">{project.country}, {project.region}</p>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Key Metrics */}
        <div className="grid gap-6 md:grid-cols-3">
          <MetricCard
            title="Risk Score"
            value={project.riskScore}
            subtitle="Lower is better"
            icon={AlertTriangle}
            variant={getRiskVariant(project.riskScore)}
          />
          <MetricCard
            title="Latest NDVI"
            value={project.latestNDVI.toFixed(3)}
            subtitle="Vegetation health index"
            icon={Activity}
            variant="success"
          />
          <MetricCard
            title="Credits Remaining"
            value={project.creditsRemaining.toLocaleString()}
            subtitle="Available for purchase"
            icon={Coins}
            variant="default"
          />
        </div>

        {/* NDVI Chart */}
        <Card className="bg-gradient-to-br from-card to-muted/20 border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Activity className="h-5 w-5 text-accent" />
              Vegetation Health (NDVI) Over Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={project.ndviHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="date" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis 
                    domain={['dataMin - 0.05', 'dataMax + 0.05']}
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      color: 'hsl(var(--foreground))'
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="hsl(var(--accent))"
                    strokeWidth={3}
                    dot={{ fill: 'hsl(var(--accent))', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: 'hsl(var(--accent))', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Description */}
        <Card className="bg-gradient-to-br from-card to-muted/20 border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Leaf className="h-5 w-5 text-accent" />
              Project Description
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground/80 leading-relaxed">{project.description}</p>
          </CardContent>
        </Card>

        {/* SDG Co-Benefits */}
        <Card className="bg-gradient-to-br from-card to-muted/20 border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Target className="h-5 w-5 text-accent" />
              Verified Co-Benefits (SDGs)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(project.sdgEvidence).map(([sdg, evidence]) => (
              <div key={sdg} className="space-y-2">
                <Badge variant="secondary" className="bg-accent/10 text-accent border-accent/20">
                  {sdg}
                </Badge>
                <p className="text-sm text-foreground/70 ml-0">{evidence}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}