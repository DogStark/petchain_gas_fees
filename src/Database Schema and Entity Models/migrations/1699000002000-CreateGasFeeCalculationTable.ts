import { MigrationInterface, QueryRunner, Table, Index } from 'typeorm';

export class CreateGasFeeCalculationTable1699000002000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'gas_fee_calculations',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'pet_id',
            type: 'uuid',
          },
          {
            name: 'transaction_type',
            type: 'enum',
            enum: ['adoption', 'medical', 'food', 'grooming', 'boarding', 'other'],
            default: "'other'",
          },
          {
            name: 'base_fee',
            type: 'decimal',
            precision: 18,
            scale: 8,
          },
          {
            name: 'priority_fee',
            type: 'decimal',
            precision: 18,
            scale: 8,
          },
          {
            name: 'total_gas_fee',
            type: 'decimal',
            precision: 18,
            scale: 8,
          },
          {
            name: 'gas_limit',
            type: 'bigint',
          },
          {
            name: 'gas_used',
            type: 'bigint',
          },
          {
            name: 'transaction_value',
            type: 'decimal',
            precision: 18,
            scale: 8,
            isNullable: true,
          },
          {
            name: 'transaction_hash',
            type: 'varchar',
            length: '66',
            isNullable: true,
          },
          {
            name: 'from_address',
            type: 'varchar',
            length: '42',
            isNullable: true,
          },
          {
            name: 'to_address',
            type: 'varchar',
            length: '42',
            isNullable: true,
          },
          {
            name: 'chain_id',
            type: 'int',
            default: 1,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['pending', 'completed', 'failed'],
            default: "'pending'",
          },
          {
            name: 'error_message',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'raw_data',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'calculated_at',
            type: 'timestamp',
            isNullable: true,
          },
        ],
        foreignKeys: [
          {
            columnNames: ['pet_id'],
            referencedTableName: 'pets',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
        ],
      }),
    );

    // Create indexes for performance
    await queryRunner.createIndex(
      'gas_fee_calculations',
      new Index('IDX_gas_fee_pet_created', ['pet_id', 'created_at']),
    );
    await queryRunner.createIndex(
      'gas_fee_calculations',
      new Index('IDX_gas_fee_type_status', ['transaction_type', 'status']),
    );
    await queryRunner.createIndex(
      'gas_fee_calculations',
      new Index('IDX_gas_fee_hash', ['transaction_hash']),
    );
    await queryRunner.createIndex(
      'gas_fee_calculations',
      new Index('IDX_gas_fee_addresses', ['from_address', 'to_address']),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('gas_fee_calculations');
  }
}
