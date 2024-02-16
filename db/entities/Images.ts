import { Entity, Property } from "@mikro-orm/mongodb";

import { BaseEntity } from "./BaseEntity.ts";

@Entity()
export class Images extends BaseEntity {
   @Property({ unique: true, nullable: false })
   public url: string;
   

   constructor(url: string) {
      super();
      
      this.url = url;
   }
};