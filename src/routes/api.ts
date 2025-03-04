import { Elysia, t } from "elysia";

const router: Elysia = new Elysia({ prefix: 'api/v1' });

import { objectConvertField } from "../helpers/converTo";

import { objectModel } from "../models/object.model"; 
import { tenantModel } from "../models/tentan.model"; 

import responce from "../helpers/responce";

import ApiController from "../controller/apiController";

const controller: ApiController = new ApiController();

// get
router
.use(objectModel)
.get('/tentants', controller.getTentants)
.get('/objects', controller.getObjects)
.get('/objects/archive', controller.getArcivedObjects)
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
.post('/object/copy/:id', controller.copyObject)
.post('/object', controller.createNewObject, 
{
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
.delete('/object/:id', controller.forceDeleteObject, {
   params: t.Object(
      {
         id: t.String({ error: "id обязателен для удаления обьекта" })
      },
      {
         error: "Такой параметр не предусмотрен в запросе!"
      }
   ),
})
.delete('/archive/object/:id', controller.deleteObject, {
   params: t.Object(
      {
         id: t.String({ error: "id обязателен для удаления обьекта" })
      },
      {
         error: "Такой параметр не предусмотрен в запросе!"
      }
   ),
})
.delete('/object/archive/:id', controller.reArchiveObject, {
   params: t.Object({
         id: t.String({ error: "id обязателен для восстановления обьекта" })
      },
      {
         error: "Такой параметр не предусмотрен в запросе!"
      })
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