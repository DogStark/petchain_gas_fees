import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { GasPrediction, ModelVersion, TrainingMetrics, ABTestResult } from './entities/prediction.entity';
import { ModelType, ModelStatus, PredictionStatus } from './enums/prediction.enum';
import { PredictionRequestDto, ModelTrainingDto, ABTestDto, ModelEvaluationDto } from './dto/prediction.dto';
import { v4 as uuidv4 } from 'uuid';
import * as tf from '@tensorflow/tfjs-node';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class PredictionService {
  private readonly logger = new Logger(PredictionService.name);
  private readonly modelDir: string;
  private readonly models: Map<string, tf.LayersModel> = new Map();

  constructor(
    private readonly configService: ConfigService,
    @InjectQueue('prediction') private readonly predictionQueue: Queue,
  ) {
    this.modelDir = this.configService.get('MODEL_DIR', 'models');
    this.ensureModelDirectory();
  }

  private ensureModelDirectory() {
    if (!fs.existsSync(this.modelDir)) {
      fs.mkdirSync(this.modelDir, { recursive: true });
    }
  }

  async predictGasPrice(dto: PredictionRequestDto): Promise<GasPrediction> {
    const prediction: GasPrediction = {
      id: uuidv4(),
      timestamp: new Date(),
      network: dto.network,
      predictedGasPrice: 0,
      confidence: 0,
      modelVersion: dto.modelVersion || 'latest',
      features: dto.features || {},
      status: PredictionStatus.PENDING,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    try {
      // Add prediction job to queue
      await this.predictionQueue.add('predict', {
        predictionId: prediction.id,
        network: dto.network,
        features: dto.features,
        modelVersion: dto.modelVersion,
      });

      return prediction;
    } catch (error) {
      this.logger.error(`Failed to create prediction: ${error.message}`);
      prediction.status = PredictionStatus.FAILED;
      prediction.error = error.message;
      return prediction;
    }
  }

  async trainModel(dto: ModelTrainingDto): Promise<ModelVersion> {
    const modelVersion: ModelVersion = {
      id: uuidv4(),
      version: `v${Date.now()}`,
      type: dto.type,
      status: ModelStatus.TRAINING,
      accuracy: 0,
      mae: 0,
      mse: 0,
      r2: 0,
      features: dto.features,
      hyperparameters: dto.hyperparameters,
      trainingDataSize: 0,
      trainingDuration: 0,
      trainedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    try {
      // Add training job to queue
      await this.predictionQueue.add('train', {
        modelVersionId: modelVersion.id,
        type: dto.type,
        features: dto.features,
        hyperparameters: dto.hyperparameters,
        baseModelVersion: dto.baseModelVersion,
      });

      return modelVersion;
    } catch (error) {
      this.logger.error(`Failed to start model training: ${error.message}`);
      modelVersion.status = ModelStatus.FAILED;
      return modelVersion;
    }
  }

  async startABTest(dto: ABTestDto): Promise<ABTestResult> {
    const abTest: ABTestResult = {
      id: uuidv4(),
      modelA: dto.modelA,
      modelB: dto.modelB,
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      trafficSplit: dto.trafficSplit,
      modelAMetrics: {
        accuracy: 0,
        mae: 0,
        mse: 0,
        r2: 0,
        predictionCount: 0,
      },
      modelBMetrics: {
        accuracy: 0,
        mae: 0,
        mse: 0,
        r2: 0,
        predictionCount: 0,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    try {
      // Add AB test job to queue
      await this.predictionQueue.add('ab-test', {
        abTestId: abTest.id,
        modelA: dto.modelA,
        modelB: dto.modelB,
        trafficSplit: dto.trafficSplit,
        criteria: dto.criteria,
      });

      return abTest;
    } catch (error) {
      this.logger.error(`Failed to start AB test: ${error.message}`);
      throw error;
    }
  }

  async evaluateModel(dto: ModelEvaluationDto): Promise<ModelVersion> {
    const modelVersion = await this.getModelVersion(dto.modelVersion);
    if (!modelVersion) {
      throw new Error(`Model version ${dto.modelVersion} not found`);
    }

    try {
      // Add evaluation job to queue
      await this.predictionQueue.add('evaluate', {
        modelVersionId: modelVersion.id,
        testData: dto.testData,
        metrics: dto.metrics,
      });

      return modelVersion;
    } catch (error) {
      this.logger.error(`Failed to evaluate model: ${error.message}`);
      throw error;
    }
  }

  async getModelVersion(version: string): Promise<ModelVersion | null> {
    // Implement model version retrieval
    // This is a placeholder - implement actual database query
    return null;
  }

  async getPredictionMetrics(modelVersion: string): Promise<TrainingMetrics[]> {
    // Implement metrics retrieval
    // This is a placeholder - implement actual database query
    return [];
  }

  async getABTestResults(abTestId: string): Promise<ABTestResult | null> {
    // Implement AB test results retrieval
    // This is a placeholder - implement actual database query
    return null;
  }

  private async loadModel(version: string): Promise<tf.LayersModel> {
    if (this.models.has(version)) {
      return this.models.get(version)!;
    }

    const modelPath = path.join(this.modelDir, `${version}/model.json`);
    const model = await tf.loadLayersModel(`file://${modelPath}`);
    this.models.set(version, model);
    return model;
  }

  private async saveModel(model: tf.LayersModel, version: string): Promise<void> {
    const modelPath = path.join(this.modelDir, version);
    if (!fs.existsSync(modelPath)) {
      fs.mkdirSync(modelPath, { recursive: true });
    }

    await model.save(`file://${modelPath}`);
  }
} 