import { 
   Entity, 
   Property, 
   OneToMany, 
   Collection,
   OnLoad,
   wrap
} from "@mikro-orm/mongodb";

import type { 
   TypeObject, 
   Object as ObjectType, 
   ObjectInfo, 
   ObjectTenantsInfo, 
   Panorama, 
   ObjectPrice, 
} from "../../types/object.types.ts"; 

import { slug } from "../../src/helpers/slug.ts";

import { BaseEntity } from "./BaseEntity.ts"; 
import { Images } from "./Images.ts";
import { Tenant } from "./Tenants.ts";

type NeedsTypes = {
   payback?: number,
   price: Partial<ObjectPrice>,
   globalRentFlow: ObjectType['globalRentFlow'],
};
const computedType = ({ payback, price, globalRentFlow }: NeedsTypes): TypeObject => {
   let rentEmpty = JSON.stringify(price.rent) === '{}',
   globalRentFlowEmpty = JSON.stringify(globalRentFlow) === '{}';

   if((!!payback && !globalRentFlowEmpty && !!price.global && !!price.profitability) && rentEmpty) return 'sale-business';
   if((!payback && globalRentFlowEmpty && rentEmpty && !price.profitability) && (!!price.global)) return 'sale';
   if((!payback && globalRentFlowEmpty && !!price.global && !price.profitability) && (!rentEmpty)) return 'rent';


   return 'hidden';
};

type CollectionImages = Collection<Images, object>;

@Entity({ tableName: "object" })
export class Objects extends BaseEntity {
   @Property({ nullable: false, unique: false, default: "hidden" })
   public type?: TypeObject;

   @Property({ nullable: false, unique: true })
   public title: string;

   @Property({ nullable: false, unique: true })
   public slug: string;

   @Property({ nullable: false })
   public description: string;

   @Property({ nullable: true })
   public panorama: Panorama;

   @Property({ nullable: false })
   public price: ObjectPrice;

   @Property({ nullable: true })
   public info: Partial<ObjectInfo>;

   @Property({ nullable: false })
   public address?: string;

   @Property({ nullable: true })
   public metro?: string;

   @Property({ 
      nullable: true, 
      unique: false,
      default: null,
   })
   public tenantsInfo?: ObjectTenantsInfo[];

   @Property({ nullable: true })
   public globalRentFlow: ObjectType['globalRentFlow'];

   @Property({ nullable: true })
   public payback?: number;

   @Property({ nullable: true })
   public agentRemuneration?: number;

   @Property({ nullable: false })
   public zone: boolean;

   @OneToMany(
      () => Images, 
      'object', 
      { 
         unique: false,
         serializer: (images: CollectionImages) => {
            return images.map(image => image.url);
         }, 
      }
   )
   images = new Collection<Images>(this);

   @OneToMany(
      () => Images, 
      'object', 
      { 
         unique: false,
         serializer: (layoutImage: CollectionImages) => {
            return layoutImage.map(layoutImage => layoutImage.url);
         }
      }
   )
   layoutImages = new Collection<Images>(this);

   @OneToMany(
      () => Tenant, 
      'object', 
      { 
         unique: false, 
         nullable: true, 
         serializer: (tenants: Collection<Tenant, object>) => {
            return tenants.map(tentant => {
               return {
                  id: tentant.id,
                  name: tentant.name,
                  category: tentant.category,
                  logo: tentant.logo.url,
               };
            });
         },
      }
   )
   tenants = new Collection<Tenant>(this);
   
   // @ts-ignore
   toJSON(strict = true, strip: unknown, ...args: never[]) {
      const resultObject = wrap(this, true).toObject([...args]);
      
      // @ts-ignore
      if(resultObject.type === 'sale-business' && resultObject.tenants?.length > 0 && resultObject.tenantsInfo?.length > 0) {
         // @ts-ignore
         const tenantCompared = resultObject.tenantsInfo?.map(tentantInfo => {
            // @ts-ignore
            const findTetant = resultObject.tenants?.find(objTentant => objTentant.id === tentantInfo?.tentantId);

            return {
               detalization: tentantInfo?.detalization,
               indexation: tentantInfo?.indexation,
               contract: tentantInfo?.contract,
               rentFlow: tentantInfo?.rentFlow,
               tentant: findTetant,
            };
         });

         // @ts-ignore
         resultObject.tenantsInfo = tenantCompared;
         // @ts-ignore
         delete resultObject.tenants;
      };

      return resultObject;
   };

   constructor({
      title,
      description,
      panorama,
      info,
      address,
      globalRentFlow,
      payback,
      price,
      metro,
      agentRemuneration,
      zone,
   }: Omit<ObjectType, 'type'>) {
      super();

      this.title = title;
      this.slug = slug(title);
      this.description = description;
      this.globalRentFlow = globalRentFlow;
      this.agentRemuneration = agentRemuneration;
      this.price = price;
      this.panorama = panorama;
      this.info = info;
      this.address = address;
      this.payback = payback;
      this.metro = metro;
      this.zone = zone; 
      this.tenantsInfo = [];
      this.type = computedType({ payback, price, globalRentFlow });
   };
};

