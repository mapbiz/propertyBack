import { Migration } from '@mikro-orm/migrations-mongodb';

export class Migration20240606101938 extends Migration {

  async up(): Promise<void> {
    const getAllObjects = await this.getCollection('object').find({
      type: 'rent',
    }).toArray();


    getAllObjects.forEach(async object => {
      await this.getCollection('object').updateOne({
        _id: object._id,
      }, {
        $set: {
          price: {
            ...object.price,
            square: object.price.global,
            global: object.price.square,
          },
        },
      })
    });
  }

  // async down(): Promise<void> {
  //   const getAllObjects = await this.getCollection('object').find({
  //     type: 'rent',
  //   }).toArray();


  //   getAllObjects.forEach(async object => {
  //     await this.getCollection('object').updateOne({
  //       _id: object._id,
  //     }, {
  //       $set: {
  //         price: {
  //           ...object.price,
  //           square: object.price.global,
  //           global: object.price.square,
  //         },
  //       },
  //     })
  //   });
  // }

}
