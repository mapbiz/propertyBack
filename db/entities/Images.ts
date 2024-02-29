import { Entity, Property, ManyToOne, OneToOne } from "@mikro-orm/mongodb";

import { BaseEntity } from "./BaseEntity.ts";

import { Objects } from "./Object.ts";
import { Tenant } from "./Tenants.ts";

@Entity()
export class Images extends BaseEntity {
   @Property({ unique: false, nullable: false })
   public url: string;

   @ManyToOne(() => Objects, {
      mapToPk: true,
      serializedPrimaryKey: true,
      nullable: true,
      default: null,
      unique: false,
   })
   object!: Objects;

   @OneToOne({
      eager: true, 
      entity: () => Tenant,
      nullable: true,
      default: null,
      mappedBy: 'logo',
      mapToPk: true,
      owner: false,
   })
   tentant!: Tenant;

   constructor(url: string) {
      super();

      this.url = url;
   }
};