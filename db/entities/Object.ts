import { Entity, Property, OneToMany, Collection, OnLoad } from "@mikro-orm/mongodb";

import type { 
   TypeObject, 
   Object as ObjectType, 
   ObjectInfo, 
   ObjectTenantsInfo, 
   Panorama, 
   ObjectPrice, 
} from "../../types/object.types.ts"; 


import { BaseEntity } from "./BaseEntity.ts"; 
import { Images } from "./Images.ts";
import { Tenant } from "./Tenants.ts";

@Entity()
export class Object extends BaseEntity {
   @Property({ persist: false })
   type?: TypeObject = 'hidden';

   @Property({ nullable: false, unique: true })
   public title: string;

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

   @Property({ nullable: true })
   public tentanstInfo?: Partial<ObjectTenantsInfo>;

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

   @OnLoad()
   async computedType() {
      const {
         payback,
         price,
         tentanstInfo,
      } = this;

      let rentEmpty = JSON.stringify(price.rent) === JSON.stringify({}),
      rentFlowEmpty = JSON.stringify(tentanstInfo?.rentFlow) === JSON.stringify({});

      if((payback !== undefined && !rentFlowEmpty)&& (price?.global === undefined && rentEmpty)) this.type = 'sale-business';
      else if(price.global !== undefined && (payback === undefined && rentEmpty && rentFlowEmpty)) this.type = 'sale';
      else if(!rentEmpty && (payback === undefined && price?.global === undefined && rentFlowEmpty)) this.type = 'rent';
      else this.type = 'hidden';
   };

   constructor({
      title,
      description,
      panorama,
      info,
      address,
      tenantsInfo,
      payback,
      price,
      metro,
      agentRemuneration,
      zone,
   }: Omit<ObjectType, 'type'>) {
      super();

      this.title = title;
      this.description = description;
      this.agentRemuneration = agentRemuneration;
      this.price = price;
      this.panorama = panorama;
      this.info = info;
      this.address = address;
      this.payback = payback;
      this.metro = metro;
      this.zone = zone; 
      this.tentanstInfo = tenantsInfo;

      console.log({ payback, global: price.global, rent: price.rent })

      // virtual fields
      let rentEmpty = JSON.stringify(price.rent) === JSON.stringify({}),
      rentFlowEmpty = JSON.stringify(tenantsInfo?.rentFlow) === JSON.stringify({});

      if((payback !== undefined && !rentFlowEmpty)&& (price?.global === undefined && rentEmpty)) this.type = 'sale-business';
      else if(price.global !== undefined && (payback === undefined && rentEmpty && rentFlowEmpty)) this.type = 'sale';
      else if(!rentEmpty && (payback === undefined && price?.global === undefined && rentFlowEmpty)) this.type = 'rent';
      else this.type = 'hidden';
   };
};

// class TObjects extends BaseEntity {
//    @Property({ persist: false })
//    type: TypeObject;

//    @Property({ unique: true, nullable: false, length: 400 })
//    public title: string;

//    @Property({ nullable: false })
//    public description: string;

//    @Property({ nullable: true })
//    public price?: number;
   
//    @Property({ nullable: true })
//    public priceMouth?: number;

//    @Property({ nullable: true })
//    public priceSquare?: number;   

//    @Property({ nullable: true })
//    public priceSquareYear?: number;

//    @Property({ nullable: true })
//    public payback?: number;

//    @Property({ nullable: true })
//    public adress?: string;

//    @Property({ nullable: true })
//    public metro?: string;

//    @Property({ nullable: true })
//    public panorama?: Partial<Panaroma>;

//    @Property({ nullable: true })
//    public techParamers?: Partial<TechParamers>;

//    @Property({ nullable: true })
//    public globalPrice?: number;

//    @Property({ nullable: true })
//    public agentRemuneration?: number;

//    @OneToMany(() => Images, img => img.object, { unique: false })
//    images = new Collection<Images>(this);

//    constructor({ 
//       title, 
//       price, 
//       priceMouth,
//       description, 
//       payback,
//       adress, 
//       metro, 
//       panorama, 
//       priceSquare, 
//       priceSquareYear,
//       techParamers, 
//       globalPrice, 
//       agentRemuneration 
//    }: Object) {
//       super();

//       this.title = title;
//       this.price = price;
//       this.priceMouth = priceMouth;
//       this.priceSquare = priceSquare;
//       this.priceSquareYear = priceSquareYear;
//       this.payback = payback;
//       this.adress = adress;
//       this.metro = metro;
//       this.panorama = panorama;
//       this.description = description;
//       this.techParamers = techParamers;
//       this.globalPrice = globalPrice;
//       this.agentRemuneration = agentRemuneration;

//       // virtual fields
//       if(globalPrice === undefined && )
//    }; 
// };
