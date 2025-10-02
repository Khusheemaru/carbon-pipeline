// src/pages/ProjectDetail.tsx (More Robust Version)
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import {
  ArrowLeft,
  AlertTriangle,
  Activity,
  Coins,
  Leaf,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MetricCard } from "@/components/MetricCard";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface DetailedProject {
  id: string;
  name: string;
  country: string;
  region: string;
  riskScore: number;
  latestNDVI: number;
  creditsRemaining: number;
  description: string;
  ndviHistory: { date: string; value: number }[];
  sdgEvidence: { [key: string]: string };
}

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState<DetailedProject | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjectData = async () => {
      if (!id) {
        setLoading(false);
        return;
      }
      setLoading(true);

      try {
        // Fetch all data in parallel
        const [projectRes, ndviRes, sdgRes] = await Promise.all([
          supabase.from("projects").select("*").eq("id", id).single(),
          supabase
            .from("project_ndvi_data")
            .select("recorded_at, ndvi_value")
            .eq("project_id", id)
            .order("recorded_at", { ascending: true }),
          supabase
            .from("project_sdgs")
            .select(`evidence_text, sdg_goals (id, name)`)
            .eq("project_id", id),
        ]);

        const { data: projectData, error: projectError } = projectRes;
        const { data: ndviHistory, error: ndviError } = ndviRes;
        const { data: sdgData, error: sdgError } = sdgRes;

        // --- NEW: Check for errors or if the project wasn't found ---
        if (projectError || !projectData) {
          console.error(
            "Error fetching project or project not found:",
            projectError
          );
          setProject(null); // Explicitly set project to null
          setLoading(false);
          return;
        }

        // Handle potential errors for other queries, but don't stop the page from loading
        if (ndviError) console.error("NDVI History Error:", ndviError);
        if (sdgError) console.error("SDG Data Error:", sdgError);

        // --- NEW: More defensive data transformation ---
        const formattedProject: DetailedProject = {
          id: projectData.id,
          name: projectData.name,
          country: projectData.country,
          region: projectData.region,
          riskScore: projectData.risk_score,
          creditsRemaining: projectData.total_credits_remaining,
          description: projectData.description || "No description available.",
          latestNDVI:
            ndviHistory && ndviHistory.length > 0
              ? ndviHistory[ndviHistory.length - 1].ndvi_value
              : 0,
          ndviHistory: (ndviHistory || []).map((d) => ({
            date: new Date(d.recorded_at).toLocaleDateString("en-US", {
              month: "short",
              year: "2-digit",
            }),
            value: parseFloat(d.ndvi_value.toFixed(4)),
          })),
          sdgEvidence: (sdgData || []).reduce((acc, item) => {
            const sdgName = `SDG ${item.sdg_goals.id}: ${item.sdg_goals.name}`;
            acc[sdgName] = item.evidence_text;
            return acc;
          }, {}),
        };

        setProject(formattedProject);
      } catch (error) {
        console.error("A critical error occurred in fetchProjectData:", error);
        setProject(null);
      } finally {
        // This ensures loading is always set to false, even if an error happens
        setLoading(false);
      }
    };

    fetchProjectData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-foreground">
        Loading Project...
      </div>
    );
  }

  if (!project) {
    // This will now show if the project ID was invalid or data failed to load
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            Project Not Found
          </h1>
          <Button onClick={() => navigate("/dashboard")} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const getRiskVariant = (score: number) => {
    if (score <= 30) return "success";
    if (score <= 60) return "warning";
    return "danger";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <Button
            onClick={() => navigate("/dashboard")} // Fixed navigation to dashboard
            variant="ghost"
            className="mb-4 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground">
              {project.name}
            </h1>
            <p className="text-lg text-muted-foreground">
              {project.country}, {project.region}
            </p>
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
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                  />
                  <XAxis
                    dataKey="date"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis
                    domain={["dataMin - 0.05", "dataMax + 0.05"]}
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      color: "hsl(var(--foreground))",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="hsl(var(--accent))"
                    strokeWidth={3}
                    dot={{ fill: "hsl(var(--accent))", strokeWidth: 2, r: 4 }}
                    activeDot={{
                      r: 6,
                      stroke: "hsl(var(--accent))",
                      strokeWidth: 2,
                    }}
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
            <p className="text-foreground/80 leading-relaxed">
              {project.description}
            </p>
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
                <Badge
                  variant="secondary"
                  className="bg-accent/10 text-accent border-accent/20"
                >
                  {sdg}
                </Badge>
                <p className="text-sm text-foreground/70 ml-0">
                  {evidence as string}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
