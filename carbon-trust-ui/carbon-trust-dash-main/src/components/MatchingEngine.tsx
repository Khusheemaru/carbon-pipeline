import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { ESGProfile } from "@/types/project";
import { regionOptions } from "@/data/mockData"; // Assuming regionOptions is still valid
import { Search, Target, Globe, TrendingUp } from "lucide-react";

// --- NEW: Define SDG options with both an ID and a display label ---
// This makes our component more robust.
const sdgOptions = [
  { id: 5, label: "SDG 5: Gender Equality" },
  { id: 7, label: "SDG 7: Affordable and Clean Energy" },
  { id: 8, label: "SDG 8: Decent Work & Economic Growth" },
  { id: 13, label: "SDG 13: Climate Action" },
  { id: 15, label: "SDG 15: Life on Land" },
];

interface MatchingEngineProps {
  onSearch: (profile: ESGProfile) => void;
  loading: boolean; // Add loading prop to disable button during search
}

export function MatchingEngine({ onSearch, loading }: MatchingEngineProps) {
  const [profile, setProfile] = useState<ESGProfile>({
    riskAppetite: "Balanced",
    prioritySDG_IDs: [], // --- UPDATED: This now holds numbers (IDs) ---
    preferredRegion: "Any",
    minimumCredits: 5000,
  });

  // --- UPDATED: This function now handles numbers (IDs) instead of strings ---
  const handleSDGChange = (sdgId: number, checked: boolean) => {
    setProfile((prev) => ({
      ...prev,
      prioritySDG_IDs: checked
        ? [...prev.prioritySDG_IDs, sdgId]
        : prev.prioritySDG_IDs.filter((id) => id !== sdgId),
    }));
  };

  const handleSearch = () => {
    onSearch(profile);
  };

  return (
    <Card className="h-fit bg-gradient-to-b from-card to-muted/20 border-border/50 shadow-lg">
      <CardHeader className="space-y-1">
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Target className="h-5 w-5 text-accent" />
          Matching Engine
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Configure your ESG investment profile
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Risk Appetite */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Risk Appetite
          </Label>
          <Select
            value={profile.riskAppetite}
            onValueChange={(value: any) =>
              setProfile((prev) => ({ ...prev, riskAppetite: value }))
            }
          >
            <SelectTrigger className="bg-background border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Conservative">Conservative</SelectItem>
              <SelectItem value="Balanced">Balanced</SelectItem>
              <SelectItem value="High-Impact">High-Impact</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* --- UPDATED: Priority SDGs Checkboxes now use the sdgOptions object --- */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-foreground">
            Priority SDGs
          </Label>
          <div className="grid gap-3 max-h-48 overflow-y-auto pr-2">
            {sdgOptions.map((sdg) => (
              <div key={sdg.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`sdg-${sdg.id}`}
                  checked={profile.prioritySDG_IDs.includes(sdg.id)}
                  onCheckedChange={(checked) =>
                    handleSDGChange(sdg.id, !!checked)
                  }
                  className="border-border data-[state=checked]:bg-accent data-[state=checked]:border-accent"
                />
                <Label
                  htmlFor={`sdg-${sdg.id}`}
                  className="text-sm text-foreground/80 leading-none"
                >
                  {sdg.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Preferred Region */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Preferred Region
          </Label>
          <Select
            value={profile.preferredRegion}
            onValueChange={(value) =>
              setProfile((prev) => ({ ...prev, preferredRegion: value }))
            }
          >
            <SelectTrigger className="bg-background border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {regionOptions.map((region) => (
                <SelectItem key={region} value={region}>
                  {region}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Minimum Credits */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-foreground">
            Minimum Credits Required: {profile.minimumCredits.toLocaleString()}
          </Label>
          <Slider
            value={[profile.minimumCredits]}
            onValueChange={([value]) =>
              setProfile((prev) => ({ ...prev, minimumCredits: value }))
            }
            max={100000}
            min={1000}
            step={1000}
            className="w-full"
          />
        </div>

        {/* Search Button */}
        <Button
          onClick={handleSearch}
          disabled={loading} // Disable button while loading
          className="w-full bg-gradient-to-r from-accent to-primary hover:from-accent/90 hover:to-primary/90 text-accent-foreground font-medium shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50"
        >
          <Search className="h-4 w-4 mr-2" />
          Find Matches
        </Button>
      </CardContent>
    </Card>
  );
}
