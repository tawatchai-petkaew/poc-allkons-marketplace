import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBirthDateToUserTable1635930878163
  implements MigrationInterface {
  name = 'AddBirthDateToUserTable1635930878163';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" ADD "birthDate" TIMESTAMP`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "birthDate"`);
  }
}
