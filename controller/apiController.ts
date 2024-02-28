import type { Context } from "elysia";

import type { ReponceWithoutData, ResponceWithData, ResponceWithError, ReponceWithReason } from "../types/responce.types"; 
import type { StoreUpload } from "../types/fileUpload.types"; 

import type { TenantCreateNewRequest } from "../types/tenant.types";

import { ObjectCreateNewRequest, ObjectTypeRequest } from "../types/object.types";
import { CustomRequestParams } from "../types/request.types"; 

import orm from "../db";
import { Object } from "../db/entities/Object"; 
import { Images } from "../db/entities/Images";
import { Tenant } from "../db/entities/Tenants"; 

import responce from "../src/helpers/responce";


export class ApiController {

   // create
   async createNewObject({ body, set, store }: ObjectCreateNewRequest): Promise<ResponceWithData<Object> | ReponceWithReason> {
      if(store?.upload?.all === undefined || (body.photos === undefined && body.photosLayout === undefined)) return responce.failureWithReason({ set, reason: "У обьекта не может не быть фотки" });

      if(store.upload.photos === undefined) return responce.failureWithError({ 
         set, 
         error: { 
            field: 'photo',
            message: 'У обьекта не может не быть фото!'
         } 
      })
      if(store.upload.photosLayout === undefined) return responce.failureWithError({
         set, 
         error: {
            field: 'photoLayout',
            message: 'У обьекта не может не быть фото планировки!'
         },
      })

      const newObject: Object = new Object({
         title: body.title,
         description: body.description,
         address: body.address,
         metro: body.metro,
         payback: body.payback,
         zone: body.zone,
         price: {
            square: body.priceSquare,
            value: body.priceValue,
            profitability: body.priceProfitability,
            global: body.priceGlobal,
            rent: {
               year: body.priceRentYear,
               mouth: body.priceRentMouth,
            },
         },
         panorama: {
            lat: body.panoramaLat,
            lon: body.panoramaLon,
         },
         tenantsInfo: {
            rentFlow: {
               year: body.tenantsInfoRentFlowYear,
               mount: body.tenantsInfoRentFlowMount,
            },
            dateContractRents: body.tenantsInfoDateContractRents,
         },
         info: {
            square: body.infoSquare,
            floor: body.infoFloor,
            ceilingHeight: (!body.infoFrom && !body.infoTo) ? body.infoCeilingHeight: {
               to: body.infoTo,
               from: body.infoFrom,
            }, 
            countEntrance: body.infoCountEntrance,
            glazing: body.infoGlazzing,
            typeWindow: body.infoTypeWindow,
            layout: body.infoLayout,
            enter: body.infoEnter,
            finishing: body.infoFinishing,
            hood: body.infoHood,
         },

      });

      
      // Создания обьекта в бд
      await orm.persist([newObject]).flush();

      const newImages = Array.isArray(store.upload.photos) ? 
         store.upload.photos.map(uploadedPhoto => new Images(uploadedPhoto.filename))
         :
         [new Images(store.upload.photos.filename)]
      ,
      newLayoutImages = Array.isArray(store.upload.photosLayout) ?
         store.upload.photosLayout.map(uploadLayoutPhoto => new Images(uploadLayoutPhoto.filename))
         :
         [new Images(store.upload.photosLayout.filename)]
      ;

      newObject.images.add(newImages);
      newObject.layoutImages.add(newLayoutImages);

      await orm.persist([...newImages, ...newLayoutImages]).flush();

      return responce.successCreated.withData<Object>({ set, data: newObject });
   };

   async addTentantToObject({ body, set, params }: CustomRequestParams) {
      const objectToAddTentant = await orm.findOneOrFail(Object, {
         id: params.id,   
      });

      orm.setFilterParams('exists', body.tentants);

      const tentantsToAdd = await orm.findAll(Tenant, {
         filters: {
            
         },
      });

      objectToAddTentant.tentants.add();

   };

   async createNewTentant({ body, set, store }: TenantCreateNewRequest) {
      const newTentant = new Tenant({
         name: body.name,
         logo: new Images(store.upload?.all.filename),
         category: body.category,
      });

      await orm.persistAndFlush([newTentant]);

      return responce.successCreated.withData({ set, data: newTentant });
   };


   // get
   async getObjects({ set, params }: ObjectTypeRequest)  {
      const getObjects = await orm.findAll(Object, {
         populate: ['images', 'layoutImages'],
      });

      return responce.successWithData({
         set,
         data: params === undefined ?
         getObjects:
         getObjects.filter(obj => obj.type === params.type)
      })
   }
   async getTentant({ set }: CustomRequestParams) {
      const allTentants = await orm.findAll(Tenant);

      if(allTentants.length === 0) return responce.successWithoutData({ set });
 
      return responce.successWithData({ set, data: allTentants });
   };
};