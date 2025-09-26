export interface Project {
  id: string;
  name: string;
  country: string;
  region: string;
  riskScore: number;
  creditsRemaining: number;
  sdgs: string[];
  description: string;
  latestNDVI: number;
  ndviHistory: { date: string; value: number }[];
  sdgEvidence: { [key: string]: string };
}

export interface ESGProfile {
  riskAppetite: 'Conservative' | 'Balanced' | 'High-Impact';
  prioritySDGs: string[];
  preferredRegion: string;
  minimumCredits: number;
}