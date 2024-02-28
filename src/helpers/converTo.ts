type Converters = 'number' | 'boolean' | 'string';
type CustomConverter = (value: unknown) => any;

type ConvertField = {
   field: string;
   convert: CustomConverter | Converters;
};
type ConvertFields = {
   fields: string[];
   convert: CustomConverter | Converters;
};


const converters = {
   'number': (numberLike: unknown): number | 'NaN' => Number(numberLike),
   'boolean': (booleanLike: unknown): boolean | null => {
      try {
         const convertToBoolean = JSON.parse(booleanLike);

         if(typeof convertToBoolean !== 'boolean') return null;

         return convertToBoolean;
      }
      catch(err) {
         return null;
      };
   },
   'string': (stringLike: unknown): string | null => {
      try {
         const convertToString = String(stringLike);

         // Значения подобные нулю
         if(!JSON.parse(convertToString)) return null;

         return convertToString;
      }
      catch(err) {
         return null
      };
   },
}; 


export const objectConvertField = <T = unknown>(objectFields: Array<ConvertField>, object: T) => {
   for(let convertField of objectFields) {
      const getConverterIfNeed: (value: unknown) => unknown = typeof convertField.convert === 'string' ? 
      converters[convertField.convert]: convertField.convert;

      Reflect.set(object, convertField.field, getConverterIfNeed(object[convertField.field]));
   };
};