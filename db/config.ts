import "dotenv/config";

import { defineConfig } from "@mikro-orm/mongodb";

import { Images } from "./entities/Images.ts";
import { Objects } from "./entities/Object.ts"; 
import { Tenant } from "./entities/Tenants.ts"; 

export default defineConfig({
   dbName: 'property',
   entities: [Images, Objects, Tenant],
   clientUrl: process.env.SERVER_DB_URL,
});

