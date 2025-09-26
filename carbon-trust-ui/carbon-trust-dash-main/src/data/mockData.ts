import { Project } from '@/types/project';

export const mockProjects: Project[] = [
  {
    id: '1',
    name: 'Amazon Rainforest Conservation',
    country: 'Brazil',
    region: 'Latin America',
    riskScore: 25,
    creditsRemaining: 12500,
    sdgs: ['SDG 15: Life on Land', 'SDG 13: Climate Action', 'SDG 6: Clean Water'],
    description: 'A comprehensive forest conservation project in the Brazilian Amazon, protecting 50,000 hectares of pristine rainforest. This initiative works directly with indigenous communities to implement sustainable land management practices while generating verified carbon credits through avoided deforestation.',
    latestNDVI: 0.85,
    ndviHistory: [
      { date: '2024-01', value: 0.82 },
      { date: '2024-02', value: 0.83 },
      { date: '2024-03', value: 0.84 },
      { date: '2024-04', value: 0.85 },
      { date: '2024-05', value: 0.86 },
      { date: '2024-06', value: 0.85 },
      { date: '2024-07', value: 0.84 },
      { date: '2024-08', value: 0.85 },
      { date: '2024-09', value: 0.87 }
    ],
    sdgEvidence: {
      'SDG 15: Life on Land': 'Protecting biodiversity hotspot with 2,500+ species documented',
      'SDG 13: Climate Action': 'Avoiding 150,000 tCO2e annually through forest preservation',
      'SDG 6: Clean Water': 'Maintaining watershed for 5 downstream communities'
    }
  },
  {
    id: '2',
    name: 'Solar Farm Development',
    country: 'Kenya',
    region: 'Africa',
    riskScore: 45,
    creditsRemaining: 8750,
    sdgs: ['SDG 7: Clean Energy', 'SDG 13: Climate Action', 'SDG 8: Decent Work'],
    description: 'Large-scale solar energy project providing clean electricity to rural communities while creating local employment opportunities. The 100MW facility displaces coal-fired power generation.',
    latestNDVI: 0.35,
    ndviHistory: [
      { date: '2024-01', value: 0.33 },
      { date: '2024-02', value: 0.34 },
      { date: '2024-03', value: 0.35 },
      { date: '2024-04', value: 0.36 },
      { date: '2024-05', value: 0.35 },
      { date: '2024-06', value: 0.34 },
      { date: '2024-07', value: 0.35 },
      { date: '2024-08', value: 0.36 },
      { date: '2024-09', value: 0.35 }
    ],
    sdgEvidence: {
      'SDG 7: Clean Energy': 'Generating 180 GWh annually of renewable electricity',
      'SDG 13: Climate Action': 'Reducing emissions by 95,000 tCO2e per year',
      'SDG 8: Decent Work': 'Created 250 permanent jobs in rural area'
    }
  },
  {
    id: '3',
    name: 'Mangrove Restoration',
    country: 'Philippines',
    region: 'Asia',
    riskScore: 35,
    creditsRemaining: 15200,
    sdgs: ['SDG 14: Life Below Water', 'SDG 15: Life on Land', 'SDG 13: Climate Action'],
    description: 'Coastal ecosystem restoration project replanting 1,000 hectares of mangrove forests to protect against storm surge while sequestering carbon and supporting marine biodiversity.',
    latestNDVI: 0.72,
    ndviHistory: [
      { date: '2024-01', value: 0.65 },
      { date: '2024-02', value: 0.67 },
      { date: '2024-03', value: 0.69 },
      { date: '2024-04', value: 0.70 },
      { date: '2024-05', value: 0.71 },
      { date: '2024-06', value: 0.72 },
      { date: '2024-07', value: 0.73 },
      { date: '2024-08', value: 0.72 },
      { date: '2024-09', value: 0.72 }
    ],
    sdgEvidence: {
      'SDG 14: Life Below Water': 'Restored nursery habitat for 45 fish species',
      'SDG 15: Life on Land': 'Replanted 850,000 mangrove seedlings with 85% survival rate',
      'SDG 13: Climate Action': 'Sequestering 25,000 tCO2e over project lifetime'
    }
  },
  {
    id: '4',
    name: 'Wind Energy Installation',
    country: 'Mexico',
    region: 'Latin America',
    riskScore: 30,
    creditsRemaining: 6800,
    sdgs: ['SDG 7: Clean Energy', 'SDG 13: Climate Action', 'SDG 9: Innovation'],
    description: 'Offshore wind farm generating clean energy for industrial operations while supporting local technical training programs and marine research initiatives.',
    latestNDVI: 0.15,
    ndviHistory: [
      { date: '2024-01', value: 0.14 },
      { date: '2024-02', value: 0.15 },
      { date: '2024-03', value: 0.15 },
      { date: '2024-04', value: 0.16 },
      { date: '2024-05', value: 0.15 },
      { date: '2024-06', value: 0.14 },
      { date: '2024-07', value: 0.15 },
      { date: '2024-08', value: 0.15 },
      { date: '2024-09', value: 0.15 }
    ],
    sdgEvidence: {
      'SDG 7: Clean Energy': 'Producing 450 GWh of renewable energy annually',
      'SDG 13: Climate Action': 'Offsetting 220,000 tCO2e from fossil fuel displacement',
      'SDG 9: Innovation': 'Training 150 technicians in wind energy maintenance'
    }
  },
  {
    id: '5',
    name: 'Reforestation Initiative',
    country: 'Indonesia',
    region: 'Asia',
    riskScore: 40,
    creditsRemaining: 9950,
    sdgs: ['SDG 15: Life on Land', 'SDG 13: Climate Action', 'SDG 1: No Poverty'],
    description: 'Community-led reforestation of degraded peatlands using native species, providing sustainable livelihoods for local communities while restoring critical carbon sinks.',
    latestNDVI: 0.68,
    ndviHistory: [
      { date: '2024-01', value: 0.58 },
      { date: '2024-02', value: 0.60 },
      { date: '2024-03', value: 0.62 },
      { date: '2024-04', value: 0.64 },
      { date: '2024-05', value: 0.66 },
      { date: '2024-06', value: 0.67 },
      { date: '2024-07', value: 0.68 },
      { date: '2024-08', value: 0.69 },
      { date: '2024-09', value: 0.68 }
    ],
    sdgEvidence: {
      'SDG 15: Life on Land': 'Planted 500,000 native trees across 2,000 hectares',
      'SDG 13: Climate Action': 'Restoring peatland carbon storage capacity of 180,000 tCO2e',
      'SDG 1: No Poverty': 'Providing income for 320 families through sustainable forestry'
    }
  }
];

export const sdgOptions = [
  'SDG 1: No Poverty',
  'SDG 6: Clean Water',
  'SDG 7: Clean Energy',
  'SDG 8: Decent Work',
  'SDG 9: Innovation',
  'SDG 13: Climate Action',
  'SDG 14: Life Below Water',
  'SDG 15: Life on Land'
];

export const regionOptions = [
  'Any',
  'Asia',
  'Latin America',
  'North America',
  'Africa',
  'Europe'
];