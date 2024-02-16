import { Entity, Property } from "@mikro-orm/mongodb";

export type Panaroma = {
   lat?: number;
   lon?: number;
};

export type TechParamers = {
   square: number;
   mouthRentFlow: number;
   typeWindow: string;
   layout: string;
   ceilingHeight: {
      from: number;
      to: number;
   } | number;
   enter: string;
   force: number;
   furnish: boolean;
};

export type Object = {
   title: string;
   description: string;
   price: number;
   priceSquare?: number;
   adress?: string;
   metro?: string;
   panorama?: Panaroma;
   techParamers?: Partial<TechParamers>;
   globalPrice?: number;
   agentRemuneration?: number;
};


import { BaseEntity } from "./BaseEntity.ts"; 

@Entity()
export class Objects extends BaseEntity {
   @Property({ unique: true, nullable: false, length: 400 })
   public title: string;

   @Property({ nullable: false })
   public price: number;

   @Property({ nullable: false })
   public description: string;

   @Property({ nullable: true })
   public priceSquare?: number;   

   @Property({ nullable: true })
   public adress?: string;

   @Property({ nullable: true })
   public metro?: string;

   @Property({ nullable: true })
   public panorama?: Partial<Panaroma>;

   @Property({ nullable: true })
   public techParamers?: Partial<TechParamers>;

   @Property({ nullable: true })
   public globalPrice?: number;

   @Property({ nullable: true })
   public agentRemuneration?: number;

   constructor({ title, price, description, adress, metro, panorama, priceSquare, techParamers, globalPrice, agentRemuneration }: Object) {
      super();

      console.log(techParamers?.ceilingHeight);

      this.title = title;
      this.price = price;
      this.priceSquare = priceSquare;
      this.adress = adress;
      this.metro = metro;
      this.panorama = panorama;
      this.description = description;
      this.techParamers = techParamers;
      this.globalPrice = globalPrice;
      this.agentRemuneration = agentRemuneration;
   }; 
};