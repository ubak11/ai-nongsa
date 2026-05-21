export interface DailyTask {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  isCompleted: boolean;
  category: 'watering' | 'ventilation' | 'pesticide' | 'inspection' | 'harvest';
  timeEstimate: string;
}

export interface WeatherData {
  temperature: number;
  humidity: number;
  condition: 'sunny' | 'cloudy' | 'rainy' | 'hot' | 'windy';
  conditionText: string;
  windSpeed: number;
  location: string;
  date: string;
}

export interface DiagnosisResult {
  id: string;
  imageUrl: string;
  diseaseName: string;
  confidence: number;
  severity: 'low' | 'medium' | 'high';
  description: string;
  treatment: string;
  pesticide: string;
  concentration: string;
  createdAt: string;
}

export interface FarmLogEntry {
  id: string;
  imageUrl: string;
  cropStage: 'seedling' | 'vegetative' | 'flowering' | 'fruiting' | 'harvest';
  cropStageText: string;
  weather: string;
  temperature: number;
  humidity: number;
  notes: string;
  createdAt: string;
  diagnosisId?: string;
}

export interface FarmSettings {
  farmerName: string;
  location: string;
  cropType: 'strawberry' | 'tomato';
  cropVariety: string;
  plantingDate: string;
  greenhouseArea: number;
}

export interface PestRisk {
  level: 1 | 2 | 3 | 4 | 5;
  description: string;
  mainThreat: string;
  preventionTip: string;
}
