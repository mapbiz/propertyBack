import { 
   Property, 
   Entity, 
   OneToOne,
   ManyToOne,
} from "@mikro-orm/core";
import type { Rel } from "@mikro-orm/core"; 

import { BaseEntity } from "./BaseEntity.ts";
import { Objects } from "./Object.ts"; 
import { Images } from "./Images.ts";

import type { Tenant as TenantType } from "../../types/tenant.types";


@Entity()
export class Tenant extends BaseEntity {
   @Property({ nullable: false, unique: true })
   public name: string;

   @Property({ nullable: false, unique: true })
   public category: string;

   @OneToOne({
      eager: true,
      entity: () => Images,
      owner: true,
      unique: false,
      serializer: image => image.url,
   }) 
   logo!: Rel<Images>;

   @ManyToOne(() => Objects, {
      mapToPk: true,
      serializedPrimaryKey: true,
      nullable: true,
      default: null,
      unique: false,
   })
   object!: Rel<Objects>

   constructor({
      name, 
      logo,
      category,
   }: TenantType) {
      super();

      this.name = name;
      this.logo = logo;
      this.category = category;
   };
};