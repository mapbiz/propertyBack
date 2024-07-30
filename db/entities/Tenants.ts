import { 
   Property, 
   Entity, 
   OneToOne,
   ManyToMany,
   Collection,
   wrap
} from "@mikro-orm/mongodb";
import type { Rel } from "@mikro-orm/core"; 

import { BaseEntity } from "./BaseEntity.ts";
import { Objects } from "./Object.ts"; 
import { Images } from "./Images.ts";

import type { Tenant as TenantType } from "../../types/tenant.types";


@Entity()
export class Tenant extends BaseEntity {
   @Property({ nullable: false, unique: true })
   public name: string;

   @Property({ nullable: false, unique: false })
   public category: string;

   @OneToOne({
      eager: true,
      entity: () => Images,
      owner: true,
      unique: false,
      serializer: image => image.url,
   }) 
   logo!: Rel<Images>;



   @ManyToMany(
      () => Objects, 
      objects => objects.tenants,
      {
         owner: false,
      }
   )
   objects: Collection<Objects> = new Collection<Objects>(this); 

   toJSON(strict = true, strip: unknown, ...args: never[]) {
      const tentant = wrap(this, true).toObject([...args]);

      // @ts-ignore
      delete tentant.objects;

      return tentant;
   };

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