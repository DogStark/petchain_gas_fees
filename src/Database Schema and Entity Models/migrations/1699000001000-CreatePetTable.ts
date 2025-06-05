import { MigrationInterface, QueryRunner, Table, Index } from 'typeorm';

export class CreatePetTable1699000001000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'pets',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'type',
            type: 'enum',
            enum: ['dog', 'cat', 'bird', 'fish', 'rabbit', 'other'],
            default: "'other'",
          },
          {
            name: 'breed',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'age',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'weight',
            type: 'decimal',
            precision: 5,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['active', 'inactive', 'adopted', 'deceased'],
            default: "'active'",
          },
          {
            name: 'owner_id',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'microchip_id',
            type: 'varchar',
            isNullable: true,
            isUnique: true,
          },
          {
            name: 'parent_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'metadata',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
        foreignKeys: [
          {
            columnNames: ['parent_id'],
            referencedTableName: 'pets',
            referencedColumnNames: ['id'],
            onDelete: 'SET NULL',
          },
        ],
      }),
    );

    // Create indexes
    await queryRunner.createIndex(
      'pets',
      new Index('IDX_pets_name', ['name']),
    );
    await queryRunner.createIndex(
      'pets',
      new Index('IDX_pets_owner_status', ['owner_id', 'status']),
    );
    await queryRunner.createIndex(
      'pets',
      new Index('IDX_pets_type_status', ['type', 'status']),
    );
    await queryRunner.createIndex(
      'pets',
      new Index('IDX_pets_created_at', ['created_at']),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('pets');
  }
}
