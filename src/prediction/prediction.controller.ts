import { Controller, Post, Body, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PredictionService } from './prediction.service';
import { PredictionRequestDto, ModelTrainingDto, ABTestDto, ModelEvaluationDto } from './dto/prediction.dto';
import { GasPrediction, ModelVersion, TrainingMetrics, ABTestResult } from './entities/prediction.entity';

@ApiTags('predictions')
@Controller('predictions')
export class PredictionController {
  constructor(private readonly predictionService: PredictionService) {}

  @Post('predict')
  @ApiOperation({ summary: 'Predict gas price' })
  @ApiResponse({ status: 201, description: 'Prediction created successfully', type: GasPrediction })
  async predictGasPrice(@Body() dto: PredictionRequestDto): Promise<GasPrediction> {
    return this.predictionService.predictGasPrice(dto);
  }

  @Post('models/train')
  @ApiOperation({ summary: 'Train a new model' })
  @ApiResponse({ status: 201, description: 'Model training started', type: ModelVersion })
  async trainModel(@Body() dto: ModelTrainingDto): Promise<ModelVersion> {
    return this.predictionService.trainModel(dto);
  }

  @Post('models/evaluate')
  @ApiOperation({ summary: 'Evaluate a model' })
  @ApiResponse({ status: 200, description: 'Model evaluation started', type: ModelVersion })
  async evaluateModel(@Body() dto: ModelEvaluationDto): Promise<ModelVersion> {
    return this.predictionService.evaluateModel(dto);
  }

  @Post('ab-test')
  @ApiOperation({ summary: 'Start an A/B test' })
  @ApiResponse({ status: 201, description: 'A/B test started', type: ABTestResult })
  async startABTest(@Body() dto: ABTestDto): Promise<ABTestResult> {
    return this.predictionService.startABTest(dto);
  }

  @Get('models/:version')
  @ApiOperation({ summary: 'Get model version details' })
  @ApiResponse({ status: 200, description: 'Model version details', type: ModelVersion })
  async getModelVersion(@Param('version') version: string): Promise<ModelVersion | null> {
    return this.predictionService.getModelVersion(version);
  }

  @Get('models/:version/metrics')
  @ApiOperation({ summary: 'Get model metrics' })
  @ApiResponse({ status: 200, description: 'Model metrics', type: [TrainingMetrics] })
  async getPredictionMetrics(@Param('version') version: string): Promise<TrainingMetrics[]> {
    return this.predictionService.getPredictionMetrics(version);
  }

  @Get('ab-test/:id')
  @ApiOperation({ summary: 'Get A/B test results' })
  @ApiResponse({ status: 200, description: 'A/B test results', type: ABTestResult })
  async getABTestResults(@Param('id') id: string): Promise<ABTestResult | null> {
    return this.predictionService.getABTestResults(id);
  }
} 