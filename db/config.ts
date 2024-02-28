import "dotenv/config";

import { defineConfig } from "@mikro-orm/mongodb";

import { Images } from "./entities/Images.ts";
import { Object } from "./entities/Object.ts"; 
import { Tenant } from "./entities/Tenants.ts"; 

export default defineConfig({
   dbName: 'property',
   debug: process.env.NODE_ENV === 'develompent',
   entities: [Images, Object, Tenant],
   clientUrl: process.env.SERVER_DB_URL,
});

