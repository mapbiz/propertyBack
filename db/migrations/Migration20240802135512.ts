import { Migration } from '@mikro-orm/migrations-mongodb';

export class Migration20240802135512 extends Migration {

  async up(): Promise<void> {
    this.getCollection('object').updateMany(
      {},
      {
        $set: {
          'price.sale': {
            square: 0,
            global: 0,
          },
        },
      }
    )
  }
  async down(): Promise<void> {
    this.getCollection('object').updateMany(
      {

      },
      {
        $unset: {
          'price.sale': undefined,
        }
      }
    )
  }

}
