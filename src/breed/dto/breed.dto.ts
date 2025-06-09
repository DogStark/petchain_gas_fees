export class CreateBreedDto {
  name: string;
  species: string;
  gasModifier: number;
}

export class UpdateBreedDto {
  name?: string;
  species?: string;
  gasModifier?: number;
} 