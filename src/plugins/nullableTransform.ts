import { Elysia } from "elysia";

const nullableTransformPlugin = new Elysia()
.decorate('nullableTransformPlugin', '')
.onBeforeHandle(({ body, params, query }) => {
   const clearNullableLikeValues = (data: Object | Array<unknown>) => {
      let clearedValues;


      if(typeof data === 'object' && !Array.isArray(data)) {
         clearedValues = {};

         for(let field in data) {
            let dataInField = data[field];

            const typeOfFieldData = typeof dataInField;
            
            if(typeOfFieldData !== 'boolean' && !dataInField) clearedValues[field] = undefined;
            if(Number.isNaN(dataInField)) clearedValues[field] = undefined;
            else clearedValues[field] = dataInField;
         };
         

         return clearedValues;
      }
      if(Array.isArray(data)) return data;

      else return null;
   };


   let clearedVariablesBody = clearNullableLikeValues(body),
   clearedVariablesParams = clearNullableLikeValues(params),
   clearedVariablesQuery = clearNullableLikeValues(query);

   for(let prop in clearedVariablesBody) {
      const data = clearedVariablesBody[prop];

      if(typeof data === 'undefined') Reflect.deleteProperty(body, prop);
      else Reflect.set(body, prop, data);
   };
})

export default nullableTransformPlugin;