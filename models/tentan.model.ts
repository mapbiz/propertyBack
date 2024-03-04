import { Elysia, t } from "elysia";

export const tenantModel = new Elysia()
.model({
   createTentant: t.Object({
      name: t.String({
         minLength: 3,
         maxLength: 1000,
         error: "Название не может быть больше 1000 или меньше 3",
      }),
      category: t.String({
         minLength: 1,
         error: "Категория не может быть меньше 1"
      }),
      logo: t.File({
         error: "Логотип арендатора должен быть файлом!"
      }),
   }),
   editTentant: t.Partial(
      t.Object({
         name: t.String({
            minLength: 3,
            maxLength: 1000,
            error: "Название не может быть больше 1000 или меньше 3",
         }),
         category: t.String({
            minLength: 1,
            error: "Категория не может быть меньше 1"
         }),
         logo: t.File({
            error: "Логотип арендатора должен быть файлом!"
         }),
      })
   ) 
})