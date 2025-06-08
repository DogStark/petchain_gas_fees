import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';
import axios from 'axios';
import { GasPrice, CalculationMethod, NetworkType } from '../entities/gas-price.entity';
import { GasPriceCalculationDto, GasPriceConfigDto, GasPriceResponseDto } from '../dto/gas-price.dto';

@Injectable()
export class GasPriceService {
  private readonly logger = new Logger(GasPriceService.name);
  private readonly cacheTTL = 60; // 1 minute cache TTL

  constructor(
    @InjectRepository(GasPrice)
    private readonly gasPriceRepository: Repository<GasPrice>,
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  async calculateGasPrice(dto: GasPriceCalculationDto): Promise<GasPriceResponseDto> {
    const { network, petCharacteristics, calculationMethod = CalculationMethod.HYBRID } = dto;

    // Get base gas price from cache or external API
    const baseGasPrice = await this.getBaseGasPrice(network);

    // Calculate multipliers based on pet characteristics
    const multipliers = await this.calculateMultipliers(petCharacteristics, calculationMethod);

    // Calculate final price
    const finalPrice = this.calculateFinalPrice(baseGasPrice, multipliers, calculationMethod);

    // Save calculation result
    const gasPrice = await this.saveGasPrice({
      network,
      basePrice: baseGasPrice.basePrice,
      priorityFee: baseGasPrice.priorityFee,
      maxFee: baseGasPrice.maxFee,
      calculationMethod,
      weightMultiplier: multipliers.weight,
      breedMultiplier: multipliers.breed,
      activityMultiplier: multipliers.activity,
      finalPrice,
      metadata: {
        blockNumber: baseGasPrice.blockNumber,
        timestamp: Date.now(),
      },
    });

    return this.mapToResponseDto(gasPrice);
  }

  private async getBaseGasPrice(network: NetworkType) {
    const cacheKey = `gas_price_${network}`;
    const cachedPrice = await this.cacheManager.get(cacheKey);

    if (cachedPrice) {
      return cachedPrice;
    }

    try {
      const response = await this.fetchGasPriceFromAPI(network);
      await this.cacheManager.set(cacheKey, response, this.cacheTTL * 1000);
      return response;
    } catch (error) {
      this.logger.error(`Failed to fetch gas price for ${network}: ${error.message}`);
      throw new NotFoundException(`Gas price data not available for ${network}`);
    }
  }

  private async fetchGasPriceFromAPI(network: NetworkType) {
    const apiUrl = this.configService.get<string>(`GAS_PRICE_API_${network.toUpperCase()}`);
    const response = await axios.get(apiUrl);

    return {
      basePrice: response.data.baseFeePerGas,
      priorityFee: response.data.maxPriorityFeePerGas,
      maxFee: response.data.maxFeePerGas,
      blockNumber: response.data.blockNumber,
    };
  }

  private async calculateMultipliers(
    petCharacteristics: any,
    method: CalculationMethod,
  ) {
    const multipliers = {
      weight: 1,
      breed: 1,
      activity: 1,
    };

    switch (method) {
      case CalculationMethod.WEIGHT_BASED:
        multipliers.weight = this.calculateWeightMultiplier(petCharacteristics.weight);
        break;
      case CalculationMethod.BREED_BASED:
        multipliers.breed = await this.calculateBreedMultiplier(petCharacteristics.breed);
        break;
      case CalculationMethod.ACTIVITY_BASED:
        multipliers.activity = this.calculateActivityMultiplier(petCharacteristics.activityLevel);
        break;
      case CalculationMethod.HYBRID:
        multipliers.weight = this.calculateWeightMultiplier(petCharacteristics.weight);
        multipliers.breed = await this.calculateBreedMultiplier(petCharacteristics.breed);
        multipliers.activity = this.calculateActivityMultiplier(petCharacteristics.activityLevel);
        break;
    }

    return multipliers;
  }

  private calculateWeightMultiplier(weight: number): number {
    // Weight-based calculation logic
    return 1 + (weight / 100);
  }

  private async calculateBreedMultiplier(breed: string): Promise<number> {
    // Breed-based calculation logic
    const breedMultipliers = {
      golden_retriever: 1.2,
      labrador: 1.1,
      german_shepherd: 1.3,
      // Add more breeds as needed
    };

    return breedMultipliers[breed] || 1;
  }

  private calculateActivityMultiplier(activityLevel: number): number {
    // Activity-based calculation logic
    return 1 + (activityLevel * 0.2);
  }

  private calculateFinalPrice(
    baseGasPrice: any,
    multipliers: any,
    method: CalculationMethod,
  ): number {
    const { basePrice, priorityFee, maxFee } = baseGasPrice;
    const { weight, breed, activity } = multipliers;

    let finalMultiplier = 1;
    switch (method) {
      case CalculationMethod.WEIGHT_BASED:
        finalMultiplier = weight;
        break;
      case CalculationMethod.BREED_BASED:
        finalMultiplier = breed;
        break;
      case CalculationMethod.ACTIVITY_BASED:
        finalMultiplier = activity;
        break;
      case CalculationMethod.HYBRID:
        finalMultiplier = (weight + breed + activity) / 3;
        break;
    }

    return (basePrice + priorityFee + maxFee) * finalMultiplier;
  }

  private async saveGasPrice(data: Partial<GasPrice>): Promise<GasPrice> {
    const gasPrice = this.gasPriceRepository.create(data);
    return this.gasPriceRepository.save(gasPrice);
  }

  private mapToResponseDto(gasPrice: GasPrice): GasPriceResponseDto {
    return {
      basePrice: gasPrice.basePrice,
      priorityFee: gasPrice.priorityFee,
      maxFee: gasPrice.maxFee,
      finalPrice: gasPrice.finalPrice,
      calculationMethod: gasPrice.calculationMethod,
      network: gasPrice.network,
      timestamp: gasPrice.createdAt,
    };
  }

  async updateCalculationConfig(dto: GasPriceConfigDto): Promise<void> {
    const { network, calculationMethod, ...multipliers } = dto;
    await this.gasPriceRepository.update(
      { network, isActive: true },
      { calculationMethod, ...multipliers },
    );
  }
} 