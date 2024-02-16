import { Elysia } from "elysia";

const router: Elysia = new Elysia({ prefix: '/api/v1' });

import { objectsModel } from "../models/Object.model"; 

import { objectConvertFields } from "../src/helpers/converTo";

import responce from "../src/helpers/responce";

import { ApiController } from "../controller/apiController";

const controller: ApiController = new ApiController();


// get
router
.get('/object', controller.getObjects);

// post
router
.use(objectsModel)
.post('/object', controller.createNewObject, 
{
   // @ts-ignore
   transform({ body, set }) {
      if(body.ceilingHeight !== undefined && (body.from !== undefined || body.to !== undefined)) return responce.failureWithErrors<any>({
         set,
         errors: [
            {
               field: 'to',
               message: 'Не может быть заполено если заполненно поле ceilingHeight'
            },
            {
               field: 'from',
               message: 'Не может быть заполено если заполненно поле ceilingHeight'
            }, 
            {
               field: 'cellingHeigth',
               message: 'Не может быть заполенно если заполенно to или from'
            }
         ],
      }) 

      objectConvertFields<unknown>([
         { convert: 'number', field: 'price' },
         { convert: 'number', field: 'priceSquare' },
         { convert: 'number', field: 'square' },
         { convert: 'number', field: 'mouthRentFlow' },
         { convert: 'number', field: 'force' },
         { convert: 'boolean', field: 'furnish' },
         { convert: 'number', field: 'to' },
         { convert: 'number', field: 'from' },
         { convert: 'number', field: 'ceilingHeight' }
      ], 
      body);
   },
   type: 'multipart/form-data',
});



export default router;