import type { Context } from "elysia";

import type { ReponceWithoutData, ResponceWithData, ResponceWithError, ReponceWithReason, ErrorObject } from "../types/responce.types"; 
import type { StoreUpload } from "../types/fileUpload.types"; 

import type { TenantCreateNewRequest } from "../types/tenant.types";

import { ObjectCreateNewRequest, ObjectTypeRequest, ObjectAddNewTenantRequest, ObjectTenantsInfo } from "../types/object.types";
import { CustomRequestParams } from "../types/request.types"; 

import orm from "../db";
import { Objects } from "../db/entities/Object"; 
import { Images } from "../db/entities/Images";
import { Tenant } from "../db/entities/Tenants"; 

import responce from "../src/helpers/responce";


export class ApiController {

   // create
   async createNewObject({ body, set, store }: ObjectCreateNewRequest): Promise<ResponceWithData<Objects> | ReponceWithReason> {
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

      const newObject: Objects = new Objects({
         title: body.title,
         description: body.description,
         address: body.address,
         metro: body.metro,
         payback: body.payback,
         zone: body.zone,
         globalRentFlow: {
            year: body.globalRentFlowYear,
            mouth: body.globalRentFlowMouth,
         },
         price: {
            square: body.priceSquare,
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
         // tenantsInfo: {
         //    rentFlow: {
         //       year: body.tenantsInfoRentFlowYear,
         //       mount: body.tenantsInfoRentFlowMount,
         //    },
         //    dateContractRents: body.tenantsInfoDateContractRents,
         // },
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

      return responce.successCreated.withData<Objects>({ set, data: newObject });
   };

   async addTentantToObject({ body, set, params }: ObjectAddNewTenantRequest) {
      const getObject: Objects | null = await orm.findOne(Objects, {
         id: params.id,
         type: 'sale-business',
      });

      if(getObject === null) return responce.failureNotFound({
         set,
         error: {
            field: "id",
            message: "Обьект не найден либо он не имеет type sale-business"
         },
      });

      const findTetants: Tenant[] = [],
      errorAddTentant: ErrorObject[] = [];


      for(let tenant of body.tentants) {
         const findTetant = await orm.findOne(Tenant, {
            id: tenant.tentantId,
         });

         if(findTetants === null) findTetants.push({ field: tenant.tentantId, message: "Не найден!"  });

         findTetants.push(findTetant);

         const findTentatIndexInObject: number = getObject.tentanstInfo?.findIndex(objTentant => objTentant.tentantId === tenant.tentantId);

         if(findTentatIndexInObject < 0) {
            getObject.tentanstInfo?.push(tenant);
            
            continue;
         }
         else {
            errorAddTentant.push({ 
               field: "tenant", 
               message: `Арендатор ${tenant.tentantId} уже существует в обьекте! \n попробуйте отредактировать!` 
            });

            continue;
         }
      };

      if(errorAddTentant.length > 0) return responce.failureWithErrors({ set, errors: errorAddTentant }); 


      getObject.tentants.add([...findTetants]);

      await orm.persist([getObject]).flush();

      return responce.successWithData({ set, data: getObject });
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
      const getObjects = await orm.findAll(Objects, {
         where: {
            type: !!params?.type ?
            params.type:
            { $ne: 'hidden' }
         },
         populate: ['images', 'layoutImages']
      });


      return responce.successWithData({ set, data: getObjects });
   }
   async getTentant({ set }: CustomRequestParams) {
      const allTentants = await orm.findAll(Tenant);

      if(allTentants.length === 0) return responce.successWithoutData({ set });
 
      return responce.successWithData({ set, data: allTentants });
   };
};