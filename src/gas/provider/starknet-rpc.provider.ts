import { Injectable } from '@nestjs/common';
import { GasDataProvider } from '../interfaces/gas-provider.interface';

@Injectable()
export class StarkNetRpcProvider implements GasDataProvider {
  async getCurrentFees() {
    // StarkNet.js implementation
  }
}