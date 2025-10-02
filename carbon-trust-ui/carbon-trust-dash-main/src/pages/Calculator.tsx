// src/pages/Calculator.tsx
import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calculator as CalculatorIcon, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";


export default function CarbonCalculator() {
  const [loading, setLoading] = useState(false);
  const [buildingPortfolio, setBuildingPortfolio] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const [portfolio, setPortfolio] = useState<{
    portfolio: any[];
    totalAllocated: number;
  } | null>(null);
  const [activityData, setActivityData] = useState({
    electricityKwh: "",
    petrolLiters: "",
    dieselLiters: "",
    domesticFlightKm: "",
  });

  const [preferences, setPreferences] = useState({
    riskAppetite: "Balanced",
    prioritySDG_IDs: [], // We'll keep this simple for now
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setActivityData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCalculate = async () => {
    setLoading(true);
    setResult(null);
    setPortfolio(null);

    const numericActivityData = {
      electricityKwh: parseFloat(activityData.electricityKwh) || 0,
      petrolLiters: parseFloat(activityData.petrolLiters) || 0,
      dieselLiters: parseFloat(activityData.dieselLiters) || 0,
      domesticFlightKm: parseFloat(activityData.domesticFlightKm) || 0,
    };

    const { data, error } = await supabase.functions.invoke(
      "calculate-footprint",
      { body: { activityData: numericActivityData } }
    );

    if (error) {
      alert("Calculation failed: " + error.message);
    } else {
      setResult(data.totalEmissions);
    }
    setLoading(false);
  };

  const handleBuildPortfolio = async () => {
    if (result === null) return;
    setBuildingPortfolio(true);

    const { data, error } = await supabase.functions.invoke("build-portfolio", {
      body: {
        preferences: preferences,
        requiredCredits: result,
      },
    });

    if (error) {
      alert("Failed to build portfolio: " + error.message);
    } else {
      setPortfolio(data);
    }
    setBuildingPortfolio(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="container mx-auto">
        <Link
          to="/dashboard"
          className="flex items-center gap-2 text-green-400 hover:underline mb-6 w-fit"
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </Link>
        <h1 className="text-4xl font-bold mb-8 text-center">
          Carbon Footprint Calculator
        </h1>
        <Card className="max-w-2xl mx-auto bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalculatorIcon className="h-5 w-5 text-green-400" />
              Enter Your Annual Activity Data
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* --- THIS IS THE RESTORED INPUT FORM --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="electricityKwh">Electricity (kWh)</Label>
                <Input
                  type="number"
                  name="electricityKwh"
                  value={activityData.electricityKwh}
                  id="electricityKwh"
                  onChange={handleInputChange}
                  className="bg-gray-700 border-gray-600"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="petrolLiters">Petrol (Litres)</Label>
                <Input
                  type="number"
                  name="petrolLiters"
                  value={activityData.petrolLiters}
                  id="petrolLiters"
                  onChange={handleInputChange}
                  className="bg-gray-700 border-gray-600"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dieselLiters">Diesel (Litres)</Label>
                <Input
                  type="number"
                  name="dieselLiters"
                  value={activityData.dieselLiters}
                  id="dieselLiters"
                  onChange={handleInputChange}
                  className="bg-gray-700 border-gray-600"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="domesticFlightKm">Domestic Flights (km)</Label>
                <Input
                  type="number"
                  name="domesticFlightKm"
                  value={activityData.domesticFlightKm}
                  id="domesticFlightKm"
                  onChange={handleInputChange}
                  className="bg-gray-700 border-gray-600"
                />
              </div>
            </div>

            <Button
              onClick={handleCalculate}
              disabled={loading || buildingPortfolio}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {loading ? "Calculating..." : "Calculate Footprint"}
            </Button>

            {result !== null && (
              <div className="text-center pt-6 mt-6 border-t border-gray-700">
                <p className="text-gray-400">
                  Your Estimated Annual Footprint is:
                </p>
                <p className="text-4xl font-bold text-green-400 mt-2">
                  {result.toLocaleString(undefined, {
                    maximumFractionDigits: 2,
                  })}
                </p>
                <p className="text-gray-400">tonnes of CO₂e</p>

                <div className="max-w-sm mx-auto my-6 p-4 border border-gray-700 rounded-lg space-y-4">
                  <h3 className="font-semibold text-lg">
                    Customize Your Portfolio
                  </h3>
                  <div>
                    <Label className="block mb-2 text-sm text-left">
                      Risk Appetite
                    </Label>
                    <Select
                      value={preferences.riskAppetite}
                      onValueChange={(value) =>
                        setPreferences((prev) => ({
                          ...prev,
                          riskAppetite: value as any,
                        }))
                      }
                    >
                      <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Conservative">
                          Conservative
                        </SelectItem>
                        <SelectItem value="Balanced">Balanced</SelectItem>
                        <SelectItem value="High-Impact">High-Impact</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button
                  onClick={handleBuildPortfolio}
                  className="mt-4"
                  disabled={buildingPortfolio || loading}
                >
                  {buildingPortfolio
                    ? "Building Portfolio..."
                    : "Suggest a Portfolio"}
                </Button>

                {portfolio && (
                  <div className="mt-6 text-left p-4 bg-gray-700 rounded-lg">
                    <h4 className="font-bold mb-2">Suggested Portfolio:</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      {portfolio.portfolio.map((item: any) => (
                        <li key={item.projectId}>
                          {item.projectName}:{" "}
                          <strong>
                            {Math.round(item.credits).toLocaleString()} credits
                          </strong>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-4 pt-4 border-t border-gray-600">
                      <h5 className="font-semibold text-sm">Reasoning:</h5>
                      <p className="text-sm text-gray-400 mt-1">
                        {portfolio.reason}
                      </p>
                    </div>
                    
                    <p className="mt-2 text-sm text-gray-400">
                      Total Allocated:{" "}
                      {portfolio.totalAllocated.toLocaleString(undefined, {
                        maximumFractionDigits: 2,
                      })}{" "}
                      credits
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
