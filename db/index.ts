import { MikroORM } from "@mikro-orm/mongodb";
import dbConfig from "./config.ts";

import { Images } from "./entities/Images.ts"; 
import { Objects } from "./entities/Objects.ts"; 

export const orm = await MikroORM.init(dbConfig);

export const IndexModel = {
   Images, 
   Objects,
};

export default orm.em.fork();