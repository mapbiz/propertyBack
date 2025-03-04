// @ts-nocheck

import { readFile } from "fs/promises";
import { resolve } from "path";

import orm from "../../db";
import { Images } from "../../db/entities/Images";
import { Objects } from "../../db/entities/Object";

(async () => {
    const dataOfJSON: Array<{ id: string; images: string[], layoutImages: string[] }> = JSON.parse(await readFile(resolve("./data.json"), 'utf-8'));


    // @ts-ignore
    const layoutImagesByObjectId = dataOfJSON.map(data => ({
        idObject: data.id,
        layoutImages: data.layoutImages,
    }));
        
    
    layoutImagesByObjectId.forEach(async (data, i) => {
        data.layoutImages.forEach(async layoutImageUrl => {
            const layoutImage = await orm.findOne(Images, {
                url: layoutImageUrl,
            });

            const object = await orm.findOne(Objects, {
                id: data.idObject,
            }, {
                fields: ['*'],
                populate: ['images', 'layoutImages']
            });

            if(object?.images.contains(layoutImage)) object.images.remove(layoutImage);
            
            object?.layoutImages.set(layoutImage);
   
                     
            await orm.flush()
        });

        console.log(i+1 === layoutImagesByObjectId.length ? "finish": 'running');
    });
})();