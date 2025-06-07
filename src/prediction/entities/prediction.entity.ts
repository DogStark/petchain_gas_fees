import { ModelType, ModelStatus, PredictionStatus } from '../enums/prediction.enum';

export class GasPrediction {
  id: string;
  timestamp: Date;
  network: string;
  predictedGasPrice: number;
  actualGasPrice?: number;
  confidence: number;
  modelVersion: string;
  features: Record<string, any>;
  status: PredictionStatus;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class ModelVersion {
  id: string;
  version: string;
  type: ModelType;
  status: ModelStatus;
  accuracy: number;
  mae: number;  // Mean Absolute Error
  mse: number;  // Mean Squared Error
  r2: number;   // R-squared score
  features: string[];
  hyperparameters: Record<string, any>;
  trainingDataSize: number;
  trainingDuration: number;
  trainedAt: Date;
  deployedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class TrainingMetrics {
  modelVersion: string;
  epoch: number;
  trainLoss: number;
  validationLoss: number;
  accuracy: number;
  timestamp: Date;
}

export class ABTestResult {
  id: string;
  modelA: string;
  modelB: string;
  startDate: Date;
  endDate: Date;
  trafficSplit: number;  // Percentage of traffic to model B
  modelAMetrics: {
    accuracy: number;
    mae: number;
    mse: number;
    r2: number;
    predictionCount: number;
  };
  modelBMetrics: {
    accuracy: number;
    mae: number;
    mse: number;
    r2: number;
    predictionCount: number;
  };
  winner?: string;
  createdAt: Date;
  updatedAt: Date;
} 