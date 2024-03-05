import objectDeep from "object-path";

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

export const objectRenameFields = <T = unknown>(objectRenamer: { [key: string]: string; }, objectOfRename: { [key: string]: T }): {[key: string]: T} => {
   for(let fieldToRename in objectRenamer) {
      const getRenameFieldInObjectRename = objectOfRename[fieldToRename],
      getNewNameOfField = objectRenamer[fieldToRename];

      if(typeof getRenameFieldInObjectRename !== 'undefined') {
         Reflect.set(objectOfRename, getNewNameOfField, getRenameFieldInObjectRename);
         Reflect.deleteProperty(objectOfRename, fieldToRename);
      };
   };

   return objectOfRename;
};

export const stringDotToObject = (path: Array<string>, separator: string = "."): any => {
   if (path.length == 0) return {}; // возвращаем пустой объект и выходим из рекурсии
 
   let [key, ...rest] = path; // определяем текущий ключ
   
   return { // возвращаем объект с нужным ключом и уходим в рекурсию.
     [key]: stringDotToObject(rest)
   };
}

export const dottedFieldToNestedObject = (object: { [key: string]: unknown }, dottedFields: Array<string>): { [key: string]: unknown } => {
   let cloneObject = {...object},
   normalDottedObject = {};

   for(let dottedField of dottedFields) {
      const dottedFieldToNestedObject = stringDotToObject(dottedField.split("."));

      if(typeof cloneObject[dottedField] !== 'undefined') {
         Reflect.deleteProperty(cloneObject, dottedField);

         objectDeep.set(dottedFieldToNestedObject, dottedField, object[dottedField]);
         objectDeep.set(normalDottedObject, dottedField, object[dottedField]);
      }
   };

   cloneObject = {
      ...cloneObject,
      ...normalDottedObject,
   };

   return cloneObject;
};