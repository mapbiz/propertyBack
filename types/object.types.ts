export type Panaroma = {
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

export type ObjectResponceBody = Omit<Object, 'panorama' | 'techParamers'> & Partial<{
   lat: number;
   lon: number;
   square: number;
   mouthRentFlow: number;
   typeWindow: string;
   layout: string;
   enter: string;
   force: number;
   furnish: boolean;
   from: number;
   to: number;
   ceilingHeight: number;
}>

export type GettedObject = Pick<Object, 'title' | 'price' | 'priceSquare' | 'adress' | 'metro'> & {
   techParametrs: {
      square: number;
   },
};