import "dotenv/config";

import { DataSource } from "typeorm";

import { Image } from "./entities/Image"; 
import { Objects } from "./entities/Object"; 

export const AppDataSource = new DataSource({
   url: process.env.SERVER_DB_URL,
   database: 'property',
   type: "mongodb",
   logging: process.env.NODE_ENV === 'develompent',
   synchronize: true,
   entities: [Image, Objects],
});
