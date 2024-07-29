import "dotenv/config";

import { defineConfig } from "@mikro-orm/mongodb";

import { Images } from "./entities/Images.ts";
import { Objects } from "./entities/Object.ts"; 
import { Tenant } from "./entities/Tenants.ts"; 
import { Admin } from "./entities/Admin.ts";

import { Migrator } from "@mikro-orm/migrations-mongodb";

export default defineConfig({
   dbName: 'property',
   extensions: [Migrator],
   entities: [Images, Objects, Tenant, Admin],
   clientUrl: process.env.SERVER_DB_URL,
});

