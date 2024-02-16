import { Elysia, t } from "elysia";

export const objectsModel = new Elysia()
.model({
   create: t.Object({
      title: t.Required(t.String({ maxLength: 400, minLength: 1 })),
      description: t.Required(t.String({ maxLength: 40000, minLength: 1 })),
      price: t.Required(t.Number()),
      priceSquare: t.Optional(t.Number()),
      adress: t.Optional(t.String()),
      metro: t.Optional(t.String()),
      lat: t.Optional(t.String()),
      lon: t.Optional(t.String()), 
      square: t.Optional(t.Number()),
      mouthRentFlow: t.Optional(t.Number()),
      typeWindow: t.Optional(t.String()),
      layout: t.Optional(t.String()),
      enter: t.Optional(t.String()),
      force: t.Optional(t.Number()),
      furnish: t.Optional(t.Boolean()),
   }),
}) 