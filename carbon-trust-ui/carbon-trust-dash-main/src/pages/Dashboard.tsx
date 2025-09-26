// src/pages/Dashboard.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { MatchingEngine, ESGProfile } from "../components/MatchingEngine"; // Import our new component
import { ProjectCard } from "../components/ProjectCard";
import { Project } from "@/types/project";
import { Leaf } from "lucide-react";

export default function Dashboard() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true); // Set to true initially

  const fetchProjects = async (profile?: ESGProfile) => {
    setLoading(true);

    const requestBody = {
      // Pass the user's preferences, or a default object for the initial load
      preferences: profile || {
        riskAppetite: "Balanced",
        preferredRegion: "Any",
        requiredCredits: 0,
        prioritySDGs: [],
      },
    };

    const { data, error } = await supabase.functions.invoke(
      "get-project-matches",
      {
        body: requestBody,
      }
    );

    if (error) {
      alert("Error fetching projects: " + error.message);
      setProjects([]);
    } else {
      setProjects(data);
    }
    setLoading(false);
  };

  // Fetch initial data when the component loads
  useEffect(() => {
    fetchProjects();
  }, []);

  const handleProjectClick = (projectId: string) => {
    navigate(`/project/${projectId}`);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="border-b border-gray-700 bg-gray-800/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-green-400">CarbonTrust AI</h1>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column - Matching Engine */}
          <div className="w-full lg:w-1/3 xl:w-1/4">
            <MatchingEngine onSearch={fetchProjects} loading={loading} />
          </div>

          {/* Right Column - Project Results */}
          <div className="w-full lg:w-2/3 xl:w-3/4">
            <h2 className="text-2xl font-bold mb-1 text-gray-100">
              Project Results
            </h2>
            <p className="text-md text-gray-400 mb-6">
              {loading
                ? "Searching..."
                : `${projects.length} projects match your criteria`}
            </p>

            {/* This is the corrected grid layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onClick={() => handleProjectClick(project.id)}
                />
              ))}
            </div>

            {!loading && projects.length === 0 && (
              <div className="text-center py-16 bg-gray-800 rounded-lg">
                <Leaf className="h-12 w-12 mx-auto mb-4 text-gray-600" />
                <h3 className="text-lg font-medium mb-2 text-gray-300">
                  No Projects Found
                </h3>
                <p className="text-sm text-gray-500">
                  Try adjusting your search criteria.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
