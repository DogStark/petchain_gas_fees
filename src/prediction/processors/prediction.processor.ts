import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GasPrediction, ModelVersion, TrainingMetrics } from '../entities/prediction.entity';
import { ModelType, ModelStatus, PredictionStatus } from '../enums/prediction.enum';
import * as tf from '@tensorflow/tfjs-node';
import { ConfigService } from '@nestjs/config';

@Processor('prediction')
export class PredictionProcessor {
  private readonly logger = new Logger(PredictionProcessor.name);

  constructor(
    @InjectRepository(GasPrediction)
    private readonly predictionRepository: Repository<GasPrediction>,
    @InjectRepository(ModelVersion)
    private readonly modelVersionRepository: Repository<ModelVersion>,
    @InjectRepository(TrainingMetrics)
    private readonly metricsRepository: Repository<TrainingMetrics>,
    private readonly configService: ConfigService,
  ) {}

  @Process('predict')
  async handlePrediction(job: Job) {
    const { predictionId, network, features, modelVersion } = job.data;

    try {
      // Load model
      const model = await this.loadModel(modelVersion);
      
      // Prepare features
      const inputTensor = this.prepareFeatures(features);
      
      // Make prediction
      const prediction = await model.predict(inputTensor) as tf.Tensor;
      const predictedValue = await prediction.data();
      
      // Update prediction record
      await this.predictionRepository.update(predictionId, {
        predictedGasPrice: predictedValue[0],
        confidence: this.calculateConfidence(prediction),
        status: PredictionStatus.COMPLETED,
        updatedAt: new Date(),
      });

      return { success: true, predictionId };
    } catch (error) {
      this.logger.error(`Prediction failed: ${error.message}`);
      
      await this.predictionRepository.update(predictionId, {
        status: PredictionStatus.FAILED,
        error: error.message,
        updatedAt: new Date(),
      });

      throw error;
    }
  }

  @Process('train')
  async handleTraining(job: Job) {
    const { modelVersionId, type, features, hyperparameters, baseModelVersion } = job.data;

    try {
      // Load training data
      const { trainData, testData } = await this.loadTrainingData();
      
      // Create and compile model
      const model = this.createModel(type, features, hyperparameters);
      
      // Train model
      const startTime = Date.now();
      const history = await model.fit(trainData.xs, trainData.ys, {
        epochs: hyperparameters.epochs || 100,
        batchSize: hyperparameters.batchSize || 32,
        validationSplit: 0.2,
        callbacks: {
          onEpochEnd: async (epoch, logs) => {
            await this.saveTrainingMetrics(modelVersionId, epoch, logs);
          },
        },
      });

      // Evaluate model
      const evaluation = await model.evaluate(testData.xs, testData.ys);
      
      // Save model
      await this.saveModel(model, modelVersionId);

      // Update model version
      await this.modelVersionRepository.update(modelVersionId, {
        status: ModelStatus.READY,
        accuracy: evaluation[1],
        mae: evaluation[0],
        trainingDuration: Date.now() - startTime,
        trainedAt: new Date(),
        updatedAt: new Date(),
      });

      return { success: true, modelVersionId };
    } catch (error) {
      this.logger.error(`Model training failed: ${error.message}`);
      
      await this.modelVersionRepository.update(modelVersionId, {
        status: ModelStatus.FAILED,
        error: error.message,
        updatedAt: new Date(),
      });

      throw error;
    }
  }

  @Process('evaluate')
  async handleEvaluation(job: Job) {
    const { modelVersionId, testData, metrics } = job.data;

    try {
      // Load model
      const model = await this.loadModel(modelVersionId);
      
      // Prepare test data
      const testTensor = this.prepareFeatures(testData);
      
      // Evaluate model
      const evaluation = await model.evaluate(testTensor.xs, testTensor.ys);
      
      // Save evaluation metrics
      await this.metricsRepository.save({
        modelVersionId,
        accuracy: evaluation[1],
        mae: evaluation[0],
        timestamp: new Date(),
      });

      return { success: true, modelVersionId };
    } catch (error) {
      this.logger.error(`Model evaluation failed: ${error.message}`);
      throw error;
    }
  }

  private async loadModel(version: string): Promise<tf.LayersModel> {
    const modelPath = this.configService.get('MODEL_DIR');
    return await tf.loadLayersModel(`file://${modelPath}/${version}/model.json`);
  }

  private async saveModel(model: tf.LayersModel, version: string): Promise<void> {
    const modelPath = this.configService.get('MODEL_DIR');
    await model.save(`file://${modelPath}/${version}/model.json`);
  }

  private createModel(type: ModelType, features: string[], hyperparameters: any): tf.LayersModel {
    const model = tf.sequential();
    
    // Add layers based on model type
    switch (type) {
      case ModelType.LSTM:
        model.add(tf.layers.lstm({
          units: hyperparameters.units || 50,
          returnSequences: true,
          inputShape: [features.length, 1],
        }));
        model.add(tf.layers.dropout({ rate: 0.2 }));
        model.add(tf.layers.lstm({ units: hyperparameters.units || 50 }));
        break;
      
      case ModelType.DENSE:
        model.add(tf.layers.dense({
          units: hyperparameters.units || 64,
          activation: 'relu',
          inputShape: [features.length],
        }));
        model.add(tf.layers.dropout({ rate: 0.2 }));
        model.add(tf.layers.dense({ units: 32, activation: 'relu' }));
        break;
    }

    // Add output layer
    model.add(tf.layers.dense({ units: 1 }));

    // Compile model
    model.compile({
      optimizer: tf.train.adam(hyperparameters.learningRate || 0.001),
      loss: 'meanSquaredError',
      metrics: ['mae'],
    });

    return model;
  }

  private prepareFeatures(features: any): tf.Tensor {
    // Convert features to tensor
    // This is a placeholder - implement actual feature preparation
    return tf.tensor2d([Object.values(features)]);
  }

  private async loadTrainingData(): Promise<{ trainData: any; testData: any }> {
    // Load and prepare training data
    // This is a placeholder - implement actual data loading
    return {
      trainData: { xs: tf.tensor2d([]), ys: tf.tensor2d([]) },
      testData: { xs: tf.tensor2d([]), ys: tf.tensor2d([]) },
    };
  }

  private async saveTrainingMetrics(modelVersionId: string, epoch: number, logs: any): Promise<void> {
    await this.metricsRepository.save({
      modelVersionId,
      epoch,
      loss: logs.loss,
      valLoss: logs.val_loss,
      mae: logs.mae,
      valMae: logs.val_mae,
      timestamp: new Date(),
    });
  }

  private calculateConfidence(prediction: tf.Tensor): number {
    // Calculate prediction confidence
    // This is a placeholder - implement actual confidence calculation
    return 0.95;
  }
} 