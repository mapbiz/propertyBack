import type { Context } from "elysia";

import type { 
   ReponceWithoutData, 
   ResponceWithData, 
   ResponceWithError, 
   ReponceWithReason, 
   ErrorObject, 
   ResponceWithErrors 
} from "../../types/responce.types"; 

import type { TenantCreateNewRequest } from "../../types/tenant.types";

import { 
   ObjectCreateNewRequest,
   ObjectTypeRequest, 
   ObjectAddNewTenantRequest, 
   ObjectDeleteTentantInObject,
   ObjectSlugRequest,
   ObjectEditTentantsRequest,
} from "../../types/object.types";
import { CustomRequestParams } from "../../types/request.types"; 

import { objectEmptyFilter } from "../helpers/filter";
import { objectRenameFields, dottedFieldToNestedObject } from "../helpers/converTo";

import orm from "../../db";
import { Objects } from "../../db/entities/Object"; 
import { Images } from "../../db/entities/Images";
import { Tenant } from "../../db/entities/Tenants"; 

import responce from "../helpers/responce";
import { Loaded, wrap } from "@mikro-orm/core";

import { slug } from "../helpers/slug";
import { tenantModel } from "../models/tentan.model";
import { SOFT_DELETABLE_FILTER } from "mikro-orm-soft-delete";

export default class ApiController {
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
      
      if(body.isNew && body.isNewPrice) return responce.failureWithError({
         set,
         error: {
            field: 'isNewPrice',
            message: 'Обьект не может быть одновременно новым и с новой ценой!'
         },
      });

      // const tryFindObject = await orm.findOne(Objects, {
      //    slug: slug(body.title),
      // });
      
      // if(tryFindObject !== null) return responce.failureWithError({
      //    set,
      //    error: {
      //       field: 'title',
      //       message: 'Заголовок должен быть уникальным',
      //    }
      // })      

      // @ts-ignore
      const newObject: Objects = new Objects({
         title: body.title,
         description: body.description,
         address: body.address,
         metro: body.metro,
         payback: body.payback,
         agentRemuneration: body.agentRemuneration,
         zone: body.zone,
         isNew: body.isNew,
         isNewPrice: body.isNewPrice,
         coordinates: {
            lat: body.lat,
            lon: body.lon,
         },
         globalRentFlow: {
            year: body.globalRentFlowYear,
            mouth: body.globalRentFlowMouth,
         },
         price: {
            square: body.priceSquare,
            profitability: body.priceProfitability,
            global: body.priceGlobal,
            sale: {
               square: body.priceSaleSquare,
               global: body.priceSaleGlobal,
            },
            rent: {
               year: body.priceRentYear,
               mouth: body.priceRentMouth,
            },
         },
         panorama: body.panorama,
         info: {
            square: body.infoSquare,
            floor: body.infoFloor,
            force: body.infoForce,
            ceilingHeight: body.infoCeilingHeight, 
            countEntrance: body.infoCountEntrance,
            glazing: body.infoGlazzing,
            typeWindow: body.infoTypeWindow,
            layout: body.infoLayout,
            enter: body.infoEnter,
            finishing: body.infoFinishing,
            hood: body.infoHood,
         },
      });
      
      if(!!body.tentantLogo) newObject.tentantLogo = new Images(store.upload.tentantLogo.filename);

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

      // await orm.persist([getObject]).flush();
      await orm.flush();


      return responce.successWithData({ set, data: getObject });
   };
   async createNewTentant({ body, set, store }: TenantCreateNewRequest): Promise<ResponceWithData<Tenant>> {
      const tryFindTentant = await orm.findOne(Tenant, {
         name: body.name,
      });

      if(tryFindTentant !== null) return responce.failureWithError({
         set,
         error: {
            field: "name",
            message: "Имя арендатора должно быть уникально!"
         },
      })

      const newTentant: Tenant = new Tenant({
         name: body.name,
         logo: new Images(store.upload?.all.filename),
         category: body.category,
      });

      await orm.persistAndFlush([newTentant]);

      return responce.successCreated.withData({ set, data: newTentant });
   };

   async copyObject({set, params}: Pick<
      CustomRequestParams<
      Context['body'], 
      Context['set'], 
      Context['store'], 
      Context['request'], 
      { id: string }
      >, 
      'set' | 'params'>) {
         const findObjectOfCopied = await orm.findOne(Objects, {
            id: params.id,
         });   

         console.log({ findObjectOfCopied });
         
      };

   // get
   async getObjects({ set, params }: ObjectTypeRequest): Promise<ResponceWithData<Loaded<Objects, "images", "title" | "images" | "info" | "address" | "metro" | "price", never>[]>>  {
      const getObjects = await orm.findAll(Objects, {
         where: {
            type: !!params?.type ?
            params.type:
            { $ne: 'hidden' }
         },
         fields: ['images', 'layoutImages', 'slug', 'type', 'title', 'price', 'info', 'address', 'metro', 'coordinates', 'isNew', 'isNewPrice'],
         populate: ['images', 'layoutImages'],
      });
      

      return responce.successWithData({ set, data: getObjects });
   }
   async getTentants({ set }: CustomRequestParams): Promise<ReponceWithoutData | ResponceWithData<Tenant[]>> {
      const allTentants: Tenant[] | [] = await orm.findAll(Tenant, {
         exclude: ['objects'],
      });

      if(allTentants.length === 0) return responce.successWithoutData({ set });
 
      return responce.successWithData({ set, data: allTentants });
   };
   async getObjectBySlug({ set, params }: ObjectSlugRequest): Promise<ResponceWithError<string> | ResponceWithData<Objects>> {
      const getCurrentObject: Objects | null = await orm.findOne(Objects, {
         slug: params.slug,
      }, {
         fields: ["*"],
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

   async getArcivedObjects({set}: ObjectTypeRequest) {
      const arcivedObjects = await orm.find(Objects, {
         deletedAt: {
            $ne: null,
         }
      }, {
         fields: ['images', 'layoutImages', 'slug', 'type', 'title', 'price', 'info', 'address', 'metro', 'coordinates', 'isNew', 'isNewPrice'],
         populate: ['images', 'layoutImages'],
         filters: {
            [SOFT_DELETABLE_FILTER]: false,
         }
      });

      
      return responce.successWithData({ set, data: arcivedObjects});
   };

   // patch
   async editTentant({ body, set, params, store }: Partial<TenantCreateNewRequest> & { params: { id: string } }) {
      delete body.logo;

      let editableTentant: Tenant | null = await orm.findOne(Tenant, {
         id: params.id,
      }, {
         exclude: ['objects']
      });

      if(!editableTentant) return responce.failureNotFound({ 
         set,
         error: {
            field: "id",
            message: `Арендатор ${params.id} не найден!`,
         }
      });

      if(!!store?.upload.logo) {
         const newLogo: Images = new Images(store.upload.logo.filename);

         editableTentant.logo = newLogo;
      };

      if(!!body?.name) {
         const tryFindTentant = await orm.findOne(Tenant, {
            name: body.name,
         });

         if(tryFindTentant !== null) return responce.failureWithError({
            set,
            error: {
               field: "name",
               message: "Имя арендатора должно быть уникально!"
            },
         })
      };

      wrap(editableTentant).assign(
         {
         ...objectEmptyFilter(body, [Object.keys(body)]),
         },
         { em: orm },
      );

      await orm.flush();

      return responce.successWithData({ set, data: editableTentant });

   };
   async editObject({body, set, params, store, request}: CustomRequestParams<Objects>) {
      try {
         if(body?.isNew === true && body?.isNewPrice === true) return responce.failureWithError({
            set,
            error: {
               field: 'isNewPrice',
               message: 'Обьект не может быть одновременно новым и с новой ценой!'
            },
         });

         delete body.photos;
         delete body.photosLayout;
         // delete body.tentantLogo;

         if(!!body?.title) {
            const tryFindObject = await orm.findOne(Objects, {
               title: body.title.toLowerCase(),
            });

            if(tryFindObject !== null) return responce.failureWithError({
               set,
               error: {
                  field: "title",
                  message: "Поле title должно быть уникальным"
               },
            })
         };

         let editableObject: Objects | null = await orm.findOne(Objects, {
            id: params.id,
         }, {
            populate: ["layoutImages", "images", "tenants", "*"],
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
         if(!!store.upload.tentantLogo) {
            const newTentantLogo = new Images(store.upload.tentantLogo.filename);
      

            editableObject.tentantLogo = newTentantLogo;
         };

         if(body.tentantLogo === 'delete') {
            const tentantLogoRef = orm.getReference(Images, editableObject.tentantLogo?.id);

            await orm.remove(tentantLogoRef).flush();

            editableObject.tentantLogo = null;
         };

         // toggle isNew fields
         if(editableObject.isNew && body?.isNewPrice === true) editableObject.isNew = false;
         if(editableObject.isNewPrice && body?.isNew === true) editableObject.isNewPrice = false;

         delete body.tentantLogo;


         const clearEmptyFields = objectEmptyFilter(body, [Object.keys(body)]),
         renameBody = dottedFieldToNestedObject(
            objectRenameFields({
               // price
               "priceSquare": "price.square",
               "priceGlobal": "price.global",
               "priceProfitability": "price.profitability",
               "priceRentYear": "price.rent.year",
               "priceRentMouth": "price.rent.mouth",
               "priceSaleGlobal": "price.sale.global",
               "priceSaleSquare": "price.sale.square",

               // globalRentFlow
               "globalRentFlowYear": "globalRentFlow.year",
               "globalRentFlowMouth": "globalRentFlow.mouth",

               // "panorama": "panorama",
               "lat": "coordinates.lat",
               "lon": "coordinates.lon",

               // info
               "infoSquare": "info.square",
               "infoFloor": "info.floor",
               "infoForce": "info.force",
               "infoCeilingHeight": "info.ceilingHeight",
               "infoCountEntrance": "info.countEntrance",
               "infoGlazzing": "info.glazing",
               "infoTypeWindow": "info.typeWindow",
               "infoLayout": "info.layout",
               "infoFinishing": "info.finishing",
               "infoEnter": "info.enter",
               "infoHood": "info.hood",
            }, clearEmptyFields),
            [
               // price
               "price.square",
               "price.global",
               "price.profitability",
               "price.rent.year",
               "price.rent.mouth",
               "price.sale.global",
               "price.sale.square",

               "coordinates.lat",
               "coordinates.lon",

               // info
               "info.square",
               "info.floor",
               "info.force",
               "info.ceilingHeight",
               "info.countEntrance",
               "info.glazing",
               "info.typeWindow",
               "info.layout",
               "info.finishing",
               "info.enter",
               "info.hood",

               // globalRentFlow
               "globalRentFlow.year",
               "globalRentFlow.mouth",

               // panorama
               "panorama",
            ],
         );

         

         wrap(editableObject).assign(
            renameBody, 
            { em: orm }
         );
         
         if(body?.title !== undefined) {
            wrap(editableObject).assign({
               slug: slug(body.title),
            }, { em: orm });
         };

         await orm.flush();
         

         return responce.successWithData({ set, data: editableObject });
      }
      catch(err) {
         console.log('error', err);
      };
   };
   async editTentantInObject({ body, set, params }: ObjectEditTentantsRequest) {
      const getObject: Objects | null = await orm.findOne(Objects, {
         id: params.id,
         type: 'sale-business',
         tenantsInfo: {
            $ne: [],
         }
      }, {
         populate: ["*"],
      });

      
      if(!getObject) return responce.failureNotFound({
         set,
         error: {
            field: "id | tenantsInfo | type",
            message: `Проверьте ввод обьекта ${params.id}, у него должен быть тип sale-business и должны уже иметься арендаторы для удаления!`
         },
      });

      const errors: ErrorObject[] = [];
      for(let tentantToEdit of body) {
         const findIndexInObject = getObject.tenantsInfo.findIndex(tentantInObject => tentantInObject.tentantId === tentantToEdit.tentantId);

         if(findIndexInObject === -1) errors.push({
            field: "tenatantId",
            message: "Такого арендатора нет в обьекте", 
         });
         else {
            getObject.tenantsInfo[findIndexInObject] = {
               ...getObject.tenantsInfo[findIndexInObject],
               ...tentantToEdit,
            };
         }

      };

      if(errors.length > 0) return responce.failureWithErrors({
         set, 
         errors,
      });

      await orm.flush();

      return responce.successWithData({ set, data: getObject });
   };

   // delete 
   async reArchiveObject({ set, params }: Pick<
      CustomRequestParams<
      Context['body'], 
      Context['set'], 
      Context['store'], 
      Context['request'], 
      { id: string }
      >, 
      'set' | 'params'>) {
         const restoreObjectOfDelete = await orm.findOne(Objects, {
            deletedAt: {
               $ne: null,
            },
            id: params.id,
            }, {
               fields: ['images', 'deletedAt', 'slug', 'type', 'title', 'price', 'info', 'address', 'metro', 'coordinates', 'isNew', 'isNewPrice'],
               populate: ['images'],
               filters: {
                  [SOFT_DELETABLE_FILTER]: false,
               }
            }  
         );
         
         if(!restoreObjectOfDelete) return responce.failureNotFound({ set, error: {
            field: "id",
            message: "Не найден обьект с таким id"
         } }); 

         restoreObjectOfDelete.deletedAt = undefined;
         
         await orm.flush();

         return responce.successWithData({ set, data: restoreObjectOfDelete });
      };

   async deleteObject({ set, params }: Pick<
      CustomRequestParams<
      Context['body'], 
      Context['set'], 
      Context['store'], 
      Context['request'], 
      { id: string }
      >, 
      'set' | 'params'>
   ): Promise<ReponceWithoutData | ResponceWithError<string>> {
      const getObjectToDelete: Objects | null = await orm.findOne(Objects, {
         id: params.id,
      }, {
         fields: ['*'],
         populate: ['images', 'layoutImages'],
      });

      if(!getObjectToDelete) return responce.failureNotFound({
         set,
         error: {
            field: 'id',
            message: `Обьект ${params.id} не найден!`
         },
      });

      // soft delete update
      getObjectToDelete.deletedAt = new Date();

      await orm.flush();

      return responce.successWithoutData({ set });
   };
   async deleteTentant({ set, params }: Pick<
      CustomRequestParams<
      Context['body'], 
      Context['set'], 
      Context['store'], 
      Context['request'], 
      { id: string }
      >, 
      'set' | 'params'>
   ): Promise<ReponceWithoutData | ResponceWithError<string>> {
      const getTentantToDelete: Tenant | null = await orm.findOne(Tenant, {
         id: params.id,
      }, {
         populate: ['*']
      });


      if(!getTentantToDelete) return responce.failureNotFound({
         set,
         error: {
            field: 'id',
            message: `Арендатор ${params.id} не найден!`
         },
      });   
      
      getTentantToDelete.objects.toArray().forEach(async (objectRemoveTentant) => {
         const getObjectRemoveTentant: Objects = await orm.findOne(Objects, {
            id: objectRemoveTentant.id,
         }, { populate: ['*'] });

         getObjectRemoveTentant.tenantsInfo?.splice(
            getObjectRemoveTentant.tenantsInfo.findIndex(tentantInObject =>  tentantInObject.tentantId === getTentantToDelete.id),
            1
         );
         getObjectRemoveTentant.tenants.remove(getTentantToDelete);

         await orm.flush();
      });
         
      await orm.removeAndFlush(getTentantToDelete);

      return responce.successWithoutData({ set });
      
   };

   async deleteTentantInObject({ set, params, body }: ObjectDeleteTentantInObject) {
      try {
         const getObject: Objects | null = await orm.findOne(Objects, {
            id: params.id,
            type: 'sale-business',
            tenantsInfo: {
               $ne: [],
            }
         }, {
            populate: ["*"],
         });

         if(!getObject) return responce.failureNotFound({
            set,
            error: {
               field: "id | tenantsInfo | type",
               message: `Проверьте ввод обьекта ${params.id}, у него должен быть тип sale-business и должны уже иметься арендаторы для удаления!`
            },
         });



         const errors: ErrorObject[] = [];
         for(let tentantOfDelete of body) {
            const findIndexTentantInObject = getObject.tenantsInfo.findIndex(tenantInObject => tenantInObject.tentantId === tentantOfDelete.tenatantId);

            if(findIndexTentantInObject === -1) errors.push({
               field: "tenatantId",
               message: "Такого арендатора нет в обьекте", 
            });

            else {
               const refGetTentantOfDelete: Tentant = getObject.tenants.find(tentant => tentant.id === tentantOfDelete.tenatantId)

               getObject.tenantsInfo.splice(findIndexTentantInObject, 1);
               getObject.tenants.remove(refGetTentantOfDelete);
            }
         };


         if(errors.length > 0) return responce.failureWithErrors({
            set, 
            errors,
         })

         await orm.flush();

         return responce.successWithData({ set, data: getObject });
      }
      catch(err) {
      };

   };
};