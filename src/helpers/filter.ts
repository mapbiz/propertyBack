
export const objectEmptyFilter = <T = unknown>(object: { [key: string]: T }, fieldsToFilter: Array<string>): { [key: string]: T } | {} => {
   const filtredObject: { [key: string]: T } = object;

   fieldsToFilter.forEach(field => {
      const currentData = object[field];

      if(typeof currentData === 'undefined') Reflect.deleteProperty(filtredObject, field);
   });

   return filtredObject;
};