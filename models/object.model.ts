import { Elysia, t } from "elysia";



export const objectModel = new Elysia()
.model({
   getObject: t.Object({
      type: t.Optional(
         t.Union(
            [
               t.Literal('sale'),
               t.Literal('rent'),
               t.Literal('sale-business'),
               t.Literal('hidden'),
            ], 
            {
               error: 'Нет такого типа обьекта'
            }
         )
      )
   }),
   // Полностью переделать, получает трансформнутые значения
   createObject: t.Object({
      agentRemuneration: t.Optional(
         t.Numeric(),
      ),
      metro: t.Optional(
         t.String()
      ),
      payback: t.Optional(
         t.String()
      ),

      // info
      infoSquare: t.Optional(
         t.String()
      ),
      infoTypeWindow: t.Optional(
         t.Symbol({
            error: "Тип окон не может быть больше чем одним словом!"
         })
      ),
      infoLayout: t.Optional(
         t.Symbol({
            error: "Планировка не может быть больше чем одним словом!"
         })
      ),
      infoCountEntrance: t.Optional(
         t.String()
      ),
      infoGlazing: t.Optional(
         t.String()
      ),
      infoCeilingHeight: t.Optional(
         t.String()
      ),
      infoFloor: t.Optional(
         t.String()
      ),
      infoTo: t.Optional(
         t.String()
      ),
      infoFrom: t.Optional(
         t.String()
      ),
      infoEnter: t.Optional(
         t.String()
      ),
      infoForce: t.Optional(
         t.String()
      ),
      infoFinishing: t.Optional(
         t.String()
      ),
      infoHood: t.Optional(
         t.Union(
            [
               t.Literal("true"),
               t.Literal("false"),
            ],
            {
               error: "Вытяжка должна быть либо true либо false!"
            }
         ),
      ),

      // price
      priceSquare: t.Optional(
         t.String()
      ),
      priceValue: t.Optional(
         t.String()
      ),
      priceProfitability: t.Optional(
         t.String()
      ),
      priceGlobal: t.Optional(
         t.String()
      ),
      priceRentYear: t.Optional(
         t.String()
      ),
      priceRentMouth: t.Optional(
         t.String()
      ),
      // tentant
      tenantsInfoRentFlowMount: t.Optional(
         t.String()
      ),
      tenantsInfoRentFlowYear: t.Optional(
         t.String()
      ),
      tenantsInfoDateContractRents: t.Optional(
         t.String()
      ),
      tenantsInfoTentants: t.Optional(
         t.String()
      ),
      // panorama
      panoramaLat: t.Optional(
         t.String()
      ),
      panoramaLon: t.Optional(
         t.String()
      ),
      
      title: t.String({
         error: "Заголовок должен быть строкой!",
      }),
      description: t.String({
         error: "Описание должно быть строкой!"
      }),
      address: t.String({
         error: "Адрес обязан быть строкой!"
      }),
      zone: t.Union(
         [
            t.Literal("true"),
            t.Literal("false"),
         ],
         {
            error: "Должно быть либо true либо false!"
         }
      ),
      photos: t.Files({
         minItems: 1,
         maxItems: 30, 
         error: "Фоток не может быть меньше 1 или больше 30!"
      }),
      photosLayout: t.Files({
         minItems: 1,
         maxItems: 30, 
         error: "Фоток не может быть меньше 1 или больше 30!"
      }),
   }),
   addTentantObject: t.Array(
      t.Object({
         tentantId: t.String(),
         indexation: t.Number(),
         contract: t.String(),
         detalization: t.Array(t.String()),
         rentFlow: t.Object({
            mounth: t.Number(),
            year: t.Number(),
         })
      })
   )
});