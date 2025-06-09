import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Repository } from 'typeorm';
import { GasPriceService } from './gas-price.service';
import { GasPrice, CalculationMethod, NetworkType } from '../entities/gas-price.entity';
import { GasPriceCalculationDto } from '../dto/gas-price.dto';
import { NotFoundException } from '@nestjs/common';

describe('GasPriceService', () => {
  let service: GasPriceService;
  let repository: Repository<GasPrice>;
  let configService: ConfigService;
  let cacheManager: any;

  const mockGasPrice = {
    id: '1',
    network: NetworkType.ETHEREUM,
    basePrice: 20,
    priorityFee: 2,
    maxFee: 30,
    calculationMethod: CalculationMethod.HYBRID,
    finalPrice: 52,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockCacheManager = {
    get: jest.fn(),
    set: jest.fn(),
  };

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GasPriceService,
        {
          provide: getRepositoryToken(GasPrice),
          useValue: mockRepository,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
      ],
    }).compile();

    service = module.get<GasPriceService>(GasPriceService);
    repository = module.get<Repository<GasPrice>>(getRepositoryToken(GasPrice));
    configService = module.get<ConfigService>(ConfigService);
    cacheManager = module.get(CACHE_MANAGER);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('calculateGasPrice', () => {
    const mockDto: GasPriceCalculationDto = {
      network: NetworkType.ETHEREUM,
      petCharacteristics: {
        weight: 10,
        breed: 'golden_retriever',
        activityLevel: 0.8,
      },
      calculationMethod: CalculationMethod.HYBRID,
    };

    it('should calculate gas price successfully', async () => {
      mockCacheManager.get.mockResolvedValue({
        basePrice: 20,
        priorityFee: 2,
        maxFee: 30,
        blockNumber: 12345,
      });

      mockRepository.create.mockReturnValue(mockGasPrice);
      mockRepository.save.mockResolvedValue(mockGasPrice);

      const result = await service.calculateGasPrice(mockDto);

      expect(result).toBeDefined();
      expect(result.network).toBe(NetworkType.ETHEREUM);
      expect(result.calculationMethod).toBe(CalculationMethod.HYBRID);
      expect(result.finalPrice).toBe(52);
    });

    it('should throw NotFoundException when gas price data is not available', async () => {
      mockCacheManager.get.mockResolvedValue(null);
      mockConfigService.get.mockReturnValue('invalid-url');

      await expect(service.calculateGasPrice(mockDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('calculateMultipliers', () => {
    it('should calculate weight-based multipliers correctly', async () => {
      const petCharacteristics = {
        weight: 10,
        breed: 'golden_retriever',
        activityLevel: 0.8,
      };

      const result = await service['calculateMultipliers'](
        petCharacteristics,
        CalculationMethod.WEIGHT_BASED,
      );

      expect(result.weight).toBeGreaterThan(1);
      expect(result.breed).toBe(1);
      expect(result.activity).toBe(1);
    });

    it('should calculate breed-based multipliers correctly', async () => {
      const petCharacteristics = {
        weight: 10,
        breed: 'golden_retriever',
        activityLevel: 0.8,
      };

      const result = await service['calculateMultipliers'](
        petCharacteristics,
        CalculationMethod.BREED_BASED,
      );

      expect(result.weight).toBe(1);
      expect(result.breed).toBe(1.2);
      expect(result.activity).toBe(1);
    });

    it('should calculate activity-based multipliers correctly', async () => {
      const petCharacteristics = {
        weight: 10,
        breed: 'golden_retriever',
        activityLevel: 0.8,
      };

      const result = await service['calculateMultipliers'](
        petCharacteristics,
        CalculationMethod.ACTIVITY_BASED,
      );

      expect(result.weight).toBe(1);
      expect(result.breed).toBe(1);
      expect(result.activity).toBeGreaterThan(1);
    });

    it('should calculate hybrid multipliers correctly', async () => {
      const petCharacteristics = {
        weight: 10,
        breed: 'golden_retriever',
        activityLevel: 0.8,
      };

      const result = await service['calculateMultipliers'](
        petCharacteristics,
        CalculationMethod.HYBRID,
      );

      expect(result.weight).toBeGreaterThan(1);
      expect(result.breed).toBeGreaterThan(1);
      expect(result.activity).toBeGreaterThan(1);
    });
  });

  describe('updateCalculationConfig', () => {
    it('should update calculation configuration successfully', async () => {
      const configDto = {
        network: NetworkType.ETHEREUM,
        calculationMethod: CalculationMethod.WEIGHT_BASED,
        weightMultiplier: 1.5,
      };

      mockRepository.update.mockResolvedValue({ affected: 1 });

      await service.updateCalculationConfig(configDto);

      expect(mockRepository.update).toHaveBeenCalledWith(
        { network: NetworkType.ETHEREUM, isActive: true },
        {
          calculationMethod: CalculationMethod.WEIGHT_BASED,
          weightMultiplier: 1.5,
        },
      );
    });
  });
}); 