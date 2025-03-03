import { Migration } from '@mikro-orm/migrations-mongodb';

export class Migration20250303082005 extends Migration {

  async up(): Promise<void> {
    this.getCollection('objects').updateMany({}, {
      $set: {
        deletedAt: null
      },
    })
  }
  async down(): Promise<void> {
    this.getCollection('objects').updateMany({}, {
      $unset: {
        deletedAt: undefined,
      },
    })
  }
}
