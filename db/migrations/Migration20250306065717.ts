import { Migration } from '@mikro-orm/migrations-mongodb';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

export class Migration20250306065717 extends Migration {
  async up(): Promise<void> {
    const dataOfJSON: Array<{
      id: string;
      images: string[];
      layoutImages: string[];
    }> = JSON.parse(await readFile(resolve('./data.json'), 'utf-8'));

    const layoutImagesCursor = this.getCollection('images').find({
      url: {
        $in: dataOfJSON
          .map(data => data.layoutImages)
          .flat(Number.MAX_SAFE_INTEGER),
      },
    });

    const layoutImages = await layoutImagesCursor.toArray();

    for (let layoutImage of layoutImages) {
      this.getCollection('images').updateOne(
        {
          _id: layoutImage._id,
        },
        {
          $set: {
            objectLayout: layoutImage.object,
          },
          $unset: {
            object: undefined,
          },
        },
      );
    }
  }
  async down(): Promise<void> {
    const dataOfJSON: Array<{
      id: string;
      images: string[];
      layoutImages: string[];
    }> = JSON.parse(await readFile(resolve('./data.json'), 'utf-8'));

    const layoutImagesCursor = this.getCollection('images').find({
      url: {
        $in: dataOfJSON
          .map(data => data.layoutImages)
          .flat(Number.MAX_SAFE_INTEGER),
      },
    });

    const layoutImages = await layoutImagesCursor.toArray();

    for (let layoutImage of layoutImages) {
      this.getCollection('images').updateOne(
        {
          _id: layoutImage._id,
        },
        {
          $set: {
            object: layoutImage.objectLayout,
          },
          $unset: {
            objectLayout: undefined,
          },
        },
      );
    }
  }
}
