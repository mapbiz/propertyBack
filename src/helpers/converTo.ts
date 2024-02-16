type Converters = 'number' | 'boolean' | 'string';
type CustomConverter = (value: unknown) => any;

type ConvertField = {
   field: string;
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

export const objectConvertFields = <T>(objectFields: Array<ConvertField>, object: T) => {
   for(let converField of objectFields) {
      const getConverterIfNeed: (value: unknown) => unknown = typeof converField.convert === 'string' ? 
      converters[converField.convert]: converField.convert;

      Reflect.set(object, converField.field, getConverterIfNeed(object[converField.field]));
   };
};