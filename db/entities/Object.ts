import { 
   Entity, 
   Property, 
   OneToMany, 
   Collection, 
   OnLoad,
   BeforeCreate,
   EntityManager,
   Filter,
   OnInit,
   EntityRepository,
   FilterQuery,
   FindOptions,
   Loaded,
   BeforeUpdate,
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
   tentanstInfo?: Partial<ObjectTenantsInfo>,
};
const computedType = ({ payback, price, globalRentFlow }: NeedsTypes): TypeObject => {
   let rentEmpty = JSON.stringify(price.rent) === '{}',
   // tentantsrentFlowEmpty = JSON.stringify(tentanstInfo?.rentFlow) === '{}',
   globalRentFlowEmpty = JSON.stringify(globalRentFlow) === '{}';

   if((!!payback && !globalRentFlowEmpty && !!price.global && !!price.profitability) && rentEmpty) return 'sale-business';
   if((!payback && globalRentFlowEmpty && rentEmpty && !price.profitability) && (!!price.global)) return 'sale';
   if((!payback && globalRentFlowEmpty && !!price.global && !price.profitability) && (!rentEmpty)) return 'rent';


   return 'hidden';
};


@Entity({ tableName: "Object" })
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

   @Property({ nullable: true, default: null, })
   public tentanstInfo?: ObjectTenantsInfo[];
   
   @Property({ nullable: true })
   public globalRentFlow: ObjectType['globalRentFlow'];

   @Property({ nullable: true })
   public payback?: number;

   @Property({ nullable: true })
   public agentRemuneration?: number;

   @Property({ nullable: false })
   public zone: boolean;


   @OneToMany(() => Images, 'object', { unique: false })
   images = new Collection<Images>(this);

   @OneToMany(() => Images, 'object', { unique: false })
   layoutImages = new Collection<Images>(this);

   @OneToMany(() => Tenant, 'object', { unique: false, nullable: true, })
   tentants = new Collection<Tenant>(this);

   @BeforeUpdate()
   async onBeforeUpdate(): Promise<void> {
      return;
   };

   constructor({
      title,
      description,
      panorama,
      info,
      address,
      globalRentFlow,
      // tenantsInfo,
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
      this.tentanstInfo = [];
      this.type = computedType({ payback, price, globalRentFlow });
   };
};
