import { MikroORM } from "@mikro-orm/mongodb";
import dbConfig from "./config.ts";

import { Images } from "./entities/Images.ts"; 
import { Objects } from "./entities/Object.ts"; 



export const orm = await MikroORM.init(dbConfig);

export default orm.em.fork();


