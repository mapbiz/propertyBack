import { Migration } from "@mikro-orm/migrations-mongodb"

export class Migration20240904105021 extends Migration {
  async up(): Promise<void> {
    this.getCollection("object").updateMany(
      {},
      {
        $set: {
          isNewPrice: false,
        },
      }
    )
  }
  async down(): Promise<void> {
    this.getCollection("object").updateMany(
      {},
      {
        $unset: {
          isNewPrice: undefined,
        },
      }
    )
  }
}
