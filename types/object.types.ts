import type { Image } from "./images.types";
import type { Context } from "elysia"; 
import type { StoreUpload } from "./fileUpload.types"; 
import type { CustomRequestParams } from "./request.types";
import type { ObjectId } from "@mikro-orm/mongodb";

export type TypeObject = 'sale' | 'rent' | 'sale-business' | 'hidden';

export type Panorama = {
   lat: number;
   lon: number;
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

export type ObjectPrice = {
   // Цена за метр кв в аренде или в продаже
   square: number;
   // Цена или Арендная ставка в месяц
   // value: number;
   // Существует только в продаже готового бизнеса
   profitability?: number;
   
   global?: number;

   rent?: {
      year?: number;
      mouth?: number;
   },
};
export type ObjectInfo = {
   square: number;
   floor: number;
   countEntrance: number;
   glazing: number;
   typeWindow: string;
   layout: string;
   ceilingHeight: {
      from: number;
      to: number;
   } | number;
   enter: string; 
   force: string;
   finishing: string;
   // Вытяжка
   hood: boolean;
};
export type ObjectTenantsInfo = {
   tentantId: ObjectId;
   detalization: string[],
   indexation: number;
   contract: string;
   rentFlow: {
      mount: number;
      year: number;
   },
   // dateContractRents: number;
};

export type Object = {
   // Общие поля
   title: string;
   slug: string;
   description: string;
   images: Omit<Image, 'id'>[];
   layoutImages: Omit<Image, 'id'>[];
   panorama: Panorama;
   agentRemuneration?: number;
   zone: boolean;

   info: Partial<ObjectInfo>;

   address?: string;
   metro?: string;

   
   // Только sale-business
   tenantsInfo?: Partial<ObjectTenantsInfo>; 
   globalRentFlow?: {
      year: number;
      mouth: number;
   };

   // Только sale-business
   payback?: number; 

   
   price: ObjectPrice;
   type: TypeObject;
};

export type ObjectRequest = Omit<Object, 'slug' | 'info' | 'tentantsInfo' | 'price' | 'type' | 'panorama'> 
& {
   // info
   infoSquare: number; 
   infoTypeWindow: string;
   infoLayout: string;
   infoCountEntrance?: number;
   infoEnter: string;
   infoCeilingHeight?: number;
   infoFinishing: string;
   infoTo?: number;
   infoFloor?: number;
   infoFrom?: number;
   infoGlazzing?: number
   infoHood: boolean;

   // price
   priceSquare: number;
   priceProfitability: number; 
   priceGlobal: number;
   priceRentYear: number;
   priceRentMouth: number;

   // tentanst
   tenantsInfoRentFlowMount: number;
   tenantsInfoRentFlowYear: number;
   tenantsInfoDateContractRents: number;

   // panorama 
   panoramaLat: number; 
   panoramaLon: number;

   // photos
   photos: Blob | Blob[],
   photosLayout: Blob | Blob[],

   // only ready bussiness
   globalRentFlowYear: number;
   globalRentFlowMouth: number;
}

export type ObjectCreateNewRequest = Pick<CustomRequestParams<ObjectRequest, Context['set'], StoreUpload>, 'body' | 'set' | 'store'>;
export type ObjectTypeRequest = Pick<CustomRequestParams<
   never, 
   Context['set'],
   never, 
   Context['request'],
   { type: 'sale' | 'rent' | 'hidden' }
>, 
'request' | 'set' | 'params'>
export type ObjectAddNewTenantRequest = Pick<CustomRequestParams<
   {
      tentants: ObjectTenantsInfo[],
   },
   Context['set'],
   Context['request'],
   { id: string }
>, 'body' | 'set' | 'params'>