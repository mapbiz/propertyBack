import "dotenv/config";

import { defineConfig } from "@mikro-orm/mongodb";

import { Images } from "./entities/Images.ts";
import { Objects } from "./entities/Objects.ts"; 

export default defineConfig({
   dbName: 'property',
   debug: process.env.NODE_ENV === 'develompent',
   entities: [Images, Objects],
   clientUrl: process.env.SERVER_DB_URL,
});

