import orm from "../../db";
import { slug } from './../helpers/slug';
import { Objects } from './../../db/entities/Object';

import colors from "colors"; 

(async () => {
   const allObjects: Objects[] = await orm.find(Objects, {});

   const beforeSlugs: {id: string, slug: string}[] = allObjects.map(object => {
      return {
         id: object.id,
         slug: object.slug,
      };
   });

   if(allObjects.length === 0) return console.log(colors.red("Обьектов для перегенерации нет!"));

   for(let object of allObjects) {
      object.slug = "";
      // console.log(
      //    colors.yellow(beforeSlugs.find(objB => objB.id === object.id)?.slug), 
      //    colors.blue('=>'), 
      //    colors.green(object.slug)
      // );
   };

   await orm.flush();
   
   for(let object of allObjects) {
      object.slug = slug(object.title);
   };
   await orm.flush();
})();