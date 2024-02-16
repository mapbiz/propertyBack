import type { Context } from "elysia";

import type { ReponceWithoutData, ResponceWithData } from "../types/responce.types"; 

import { ObjectResponceBody } from "../types/object.types";
import { CustomRequestParams } from "../types/request.types"; 

import orm from "../db";
import { Objects } from "../db/entities/Objects"; 
import responce from "../src/helpers/responce";

type CustomBodyAndSet<T, TSet = Context['set']> = Pick<CustomRequestParams<T, TSet>, 'body' | 'set'>;

export class ApiController {

   // create
   async createNewObject({ body, set }: CustomBodyAndSet<ObjectResponceBody>): Promise<ResponceWithData<Object>> {
      const newObject: Objects = new Objects({
         title: body.title,
         price: body.price,
         description: body.description,
         metro: body.metro,
         adress: body.adress,
         globalPrice: body.globalPrice,
         agentRemuneration: body.agentRemuneration,
         techParamers: {
            square: body.square,
            mouthRentFlow: body.mouthRentFlow,
            typeWindow: body.typeWindow,
            layout: body.layout,
            ceilingHeight: (!body.from && !body.to) ? body.ceilingHeight: {
               to: body.to,
               from: body.from,
            }, 
            enter: body.enter,
            force: body.force,
            furnish: body.furnish,
         },
         panorama: {
            lat: body.lat,
            lon: body.lon,
         }, 
      });
   
      await orm.persist([newObject]).flush();


      return responce.successCreated.withData<Objects>({ set, data: newObject });
   };

   // get
   async getObjects({ set }: CustomBodyAndSet<never>): Promise<ResponceWithData<Array<Object>> | ReponceWithoutData> {
      const getAllObjects: Array<Object> | [] = await orm.findAll(Objects);

      return getAllObjects.length > 0 ? 
      responce.successWithData<Array<Object>>({ set, data: getAllObjects }): 
      responce.successWithoutData({ set });
   }
};