import { Elysia, t } from "elysia";

const router: Elysia = new Elysia({ prefix: '/api/v1' });

import { objectConvertField } from "../src/helpers/converTo";

import { objectModel } from "../models/object.model"; 
import { tenantModel } from "../models/tentan.model"; 

import responce from "../src/helpers/responce";

import { ApiController } from "../controller/apiController";

const controller: ApiController = new ApiController();


// get
router
.use(objectModel)
.get('/tentants', controller.getTentants)
.get('/objects', controller.getObjects)
.get('/object/:slug', controller.getObjectBySlug)
.get('/objects/:type', controller.getObjects, {
   params: 'getObject',
})


// post object
router
.use(objectModel)
.post('/object/add-tentant/:id', controller.addTentantToObject, {
   params: t.Object({
      id: t.String()
   }),
})
.post('/object', controller.createNewObject, 
{
   // @ts-ignore
   // transform({ body, set }) {
   //    objectConvertField<unknown>([
   //       // all
   //       { convert: 'number', field: 'agentRemuneration' },
   //       { convert: 'boolean', field: 'zone' },

   //       // only ready bus
   //       { convert: 'number', field: 'payback' },
   //       { convert: 'number', field: 'globalRentFlowYear' },
   //       { convert: 'number', field: 'globalRentFlowMouth' },

   //       // info
   //       { convert: 'number', field: 'infoSquare' },
   //       { convert: 'number', field: 'infoCeilingHeight' },
   //       { convert: 'number', field: 'infoTo' },
   //       { convert: 'number', field: 'infoFrom' },
   //       { convert: 'number', field: 'infoFloor' },
   //       { convert: 'number', field: 'infoCountEntrance' },
   //       { convert: 'number', field: 'infoGlazing' },
   //       { convert: 'boolean', field: 'infoHood' },

   //       // price
   //       { convert: 'number', field: 'priceSquare' },
   //       { convert: 'number', field: 'priceProfitability' },
   //       { convert: 'number', field: 'priceGlobal' },
   //       { convert: 'number', field: 'priceRentYear' },
   //       { convert: 'number', field: 'priceRentMouth' },

   //       // tentansInfo 
   //       { convert: 'number', field: 'tenantsInfoRentFlowMount' }, 
   //       { convert: 'number', field: 'tenantsInfoRentFlowYear' },
   //       { convert: 'number', field: 'tenantsInfoDateContractRents' },

   //       // panorama
   //       { convert: 'number', field: 'panoramaLat' },
   //       { convert: 'number', field: 'panoramaLon' },
   //    ], body);
   // },
   body: 'createObject',
   type: 'multipart/form-data',
});

// post tentant
router
.use(tenantModel)
.post('/tentant', controller.createNewTentant, {
   body: 'createTentant',
   type: 'multipart/form-data',
});

// edit object
router
.use(objectModel)
.put('/object/:id', controller.editObject, {
   params: 'editObjectParams',
   body: 'editObjectBody',
})
.put('/object/update-tentant/:id', controller.editTentantInObject, {
   body: "editObjectTentants",
   params: t.Object({
      id: t.String({ error: "id обьекта обязателен для изменения его арендатора" })
   })
})
.patch('/object/:id', controller.editObject, {
   params: 'editObjectParams',
   body: 'editObjectBody',
});

// edit tentant
router
.use(tenantModel)
.patch("/tentant/:id", controller.editTentant, {
   params: t.Object(
      {
         id: t.String({ error: "Для редактирования арендатора необходимо передать его id" })
      },
      { error: "Параметр непрдусмотрен" }
   ),
   body: 'editTentant',
});

// delete
router
.use(objectModel)
.delete('/object/:id', controller.deleteObject, {
   params: t.Object(
      {
         id: t.String({ error: "id обязателен для удаления обьекта" })
      },
      {
         error: "Такой параметр не предусмотрен в запросе!"
      }
   ),
})
.delete('/tentant/:id', controller.deleteTentant, {
   params: t.Object(
      {
         id: t.String({ error: "id обязателен для удаления арендодатора!" })
      },
      {
         error: "Такой параметр не предусмотрен в запросе!",
      }
   )
})
.delete('/object/remove-tentant/:id', controller.deleteTentantInObject, {
   params: t.Object(
      {
         id: t.String({ error: "id обязателен для удаления арендодатора из обьекта!" })
      },
      {
         error: "Такой параметр не предусмотрен в запросе!",
      }
   ),
   body: "deleteTentantsObject",
});

export default router;