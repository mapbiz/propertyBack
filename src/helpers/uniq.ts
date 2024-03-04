/**
 * 
 * @param { object[] } array 
 * @param { string } key 
 * @description Уникализация по ключу, массивов, обьектов
 * @example
 *  let array = [{ test: 1 }, { test: 2 }, { test: 1 }];
 *  uniqBy(array, 'test'); // [{ test:1 }, { test: 2 }]
 */
export function uniqBy(array: unknown[], key: string): unkown[] {
   return [...new Map(array.map(item => [item[key], item] )).values() ];
};