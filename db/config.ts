import "dotenv/config";

import { defineConfig } from "@mikro-orm/mongodb";

import { Images } from "./entities/Images.ts";
import { Objects } from "./entities/Object.ts"; 
import { Tenant } from "./entities/Tenants.ts"; 
import { Admin } from "./entities/Admin.ts";

import { Migrator } from "@mikro-orm/migrations-mongodb";
import {SoftDeleteHandler} from "mikro-orm-soft-delete";

export default defineConfig({
   dbName: process.env.SERVER_DB_NAME,
   extensions: [Migrator, SoftDeleteHandler],
   migrations: {
      path: "./db/migrations",
      snapshot: true,
      emit: "ts",
      transactional: false,
   },
   entities: [Images, Objects, Tenant, Admin],
   clientUrl: process.env.SERVER_DB_URL,
});

