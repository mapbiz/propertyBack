import type { Context } from "elysia";

import type { ReponceWithoutData, ResponceWithData, ResponceWithError, ReponceWithReason, ErrorObject, ResponceWithErrors } from "../types/responce.types"; 
import type { StoreUpload } from "../types/fileUpload.types"; 

import type { TenantCreateNewRequest } from "../types/tenant.types";

import { ObjectCreateNewRequest, ObjectTypeRequest, ObjectAddNewTenantRequest, ObjectTenantsInfo, ObjectSlugRequest } from "../types/object.types";
import { CustomRequestParams } from "../types/request.types"; 

import orm from "../db";
import { Objects } from "../db/entities/Object"; 
import { Images } from "../db/entities/Images";
import { Tenant } from "../db/entities/Tenants"; 

import responce from "../src/helpers/responce";
import { Loaded } from "@mikro-orm/core";


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
         info: {
            square: body.infoSquare,
            floor: body.infoFloor,
            force: body.infoForce,
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
   async addTentantToObject({ body, set, params }: ObjectAddNewTenantRequest): Promise<ResponceWithErrors | ResponceWithError<string> | ResponceWithData<Objects>> {
      const getObject: Objects | null = await orm.findOne(Objects, {
         id: params.id,
         type: 'sale-business',
      }, {
         populate: ['images', 'layoutImages', 'tenants'],
      });

      if(getObject === null) return responce.failureNotFound({
         set,
         error: {
            field: "id",
            message: "Обьект не найден либо он не имеет type sale-business"
         },
      });

      const errorAddTentant: ErrorObject[] = [];

      for(let tenant of body.tentants) {
         const findTetant: Tenant | null = await orm.findOne(Tenant, {
            id: tenant.tentantId,
         });

         if(findTetant === null) errorAddTentant.push({ field: tenant.tentantId, message: "Не найден!"  });

         else {
            const findIndexTentantInObject: number = getObject.tenantsInfo?.findIndex(objTentant => objTentant.tentantId === tenant.tentantId);
         
            if(findIndexTentantInObject < 0) {
               getObject.tenantsInfo?.push(tenant);
               getObject.tenants.add(findTetant);
            }
            else errorAddTentant.push({ 
               field: "tenant", 
               message: `Арендатор ${tenant.tentantId} уже существует в обьекте!`, 
            });
         }
      };

      if(errorAddTentant.length > 0) return responce.failureWithErrors({ set, errors: errorAddTentant }); 

      await orm.persist([getObject]).flush();

      return responce.successWithData({ set, data: getObject });
   };
   async createNewTentant({ body, set, store }: TenantCreateNewRequest): Promise<ResponceWithData<Tenant>> {
      const newTentant: Tenant = new Tenant({
         name: body.name,
         logo: new Images(store.upload?.all.filename),
         category: body.category,
      });

      await orm.persistAndFlush([newTentant]);

      return responce.successCreated.withData({ set, data: newTentant });
   };


   // get
   async getObjects({ set, params }: ObjectTypeRequest): Promise<ResponceWithData<Loaded<Objects, "images", "title" | "images" | "info" | "address" | "metro" | "price", never>[]>>  {
      const getObjects: Loaded<Objects, "images", "title" | "images" | "info" | "address" | "metro" | "price", never>[] = await orm.findAll(Objects, {
         where: {
            type: !!params?.type ?
            params.type:
            { $ne: 'hidden' }
         },
         fields: ['images', 'slug', 'type', 'title', 'price', 'info', 'address', 'metro'],
         populate: ['images'],
      });
      return responce.successWithData({ set, data: getObjects });
   }
   async getTentants({ set }: CustomRequestParams): Promise<ReponceWithoutData | ResponceWithData<Tenant[]>> {
      const allTentants: Tenant[] | [] = await orm.findAll(Tenant);

      if(allTentants.length === 0) return responce.successWithoutData({ set });
 
      return responce.successWithData({ set, data: allTentants });
   };
   async getObjectBySlug({ set, params }: ObjectSlugRequest): Promise<ResponceWithError<string> | ResponceWithData<Objects>> {
      const getCurrentObject: Objects | null = await orm.findOne(Objects, {
         slug: params.slug,
      }, {
         populate: ['*'],
      });

      if(!getCurrentObject) return responce.failureNotFound({ 
         set, 
         error: { 
            field: 'slug', 
            message: `Обьекта со слагом ${params.slug} не существует!` 
         } 
      });


      return responce.successWithData({ set, data: getCurrentObject });
   };

   // patch
   async editObject({body, set, params, store, request}: CustomRequestParams) {
      delete body.photos;
      delete body.photosLayout;

      let editableObject: Objects | null = await orm.findOne(Objects, {
         id: params.id,
      }, {
         exclude: ["tenants", "tenantsInfo"],
         populate: ["layoutImages", "images"],
      });

      if(editableObject === null) return responce.failureNotFound({ set, error: { field: "id", message: `Обьект ${params.id} не найден!` } });

      if(!!store.upload?.photos) {
         const newImages = Array.isArray(store.upload.photos) ? 
         store.upload.photos.map(uploadedPhoto => new Images(uploadedPhoto.filename))
         :
         [new Images(store.upload.photos.filename)];
      

         request.method === 'patch' ? editableObject.images.add(newImages): editableObject.images.set(newImages);
      };
      if(!!store.upload.photosLayout) {
         const newLayoutImages = Array.isArray(store.upload.photosLayout) ?
         store.upload.photosLayout.map(uploadLayoutPhoto => new Images(uploadLayoutPhoto.filename))
         :
         [new Images(store.upload.photosLayout.filename)];


         request.method === 'patch' ? editableObject.layoutImages.add(newLayoutImages): editableObject.layoutImages.set(newLayoutImages);
      };

      editableObject = {
         ...editableObject,
         id: (editableObject._id as string),
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
      };


      await orm.flush(); 

      delete editableObject._id;

      return responce.successWithData({ set, data: editableObject });
   };
};