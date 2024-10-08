import type { Image } from "./images.types"
import type { Context } from "elysia"
import type { StoreUpload } from "./fileUpload.types"
import type { CustomRequestParams } from "./request.types"
import { Images } from "../db/entities/Images"

export type TypeObject = "sale" | "rent" | "sale-business" | "hidden"

export type Coordinates = `${"http:" | "https:"}${string}`

export type TechParamers = {
  square: number
  mouthRentFlow: number
  typeWindow: string
  layout: string
  ceilingHeight:
    | {
        from: number
        to: number
      }
    | number
  enter: string
  force: number
  furnish: boolean
}

export type ObjectPrice = {
  // Цена за метр кв в аренде или в продаже
  square: number
  // Цена или Арендная ставка в месяц
  // value: number;
  // Существует только в продаже готового бизнеса
  profitability?: number

  global?: number

  sale?: {
    global: number
    square: number
  }

  rent?: {
    year?: number
    mouth?: number
  }
}
export type ObjectInfo = {
  square: number
  floor: number
  countEntrance: string
  glazing: number
  typeWindow: string
  layout: string
  ceilingHeight: string
  enter: string
  force: number
  finishing: string
  // Вытяжка
  hood: boolean
}
export type ObjectTenantsInfo = {
  tentantId: string
  detalization: string[]
  indexation: number
  contract: string
  rentFlow: {
    mount: number
    year: number
  }
  // dateContractRents: number;
}

export type Object = {
  // Общие поля
  title: string
  slug: string
  description: string
  images: Omit<Image, "id">[]
  layoutImages: Omit<Image, "id">[]
  panorama: `${"http:" | "https:"}${string}`
  coordinates: {
    lat: number
    lon: number
  }

  isNew: boolean
  isNewPrice: boolean
  agentRemuneration?: number
  zone: boolean

  info: Partial<ObjectInfo>

  address?: string
  metro?: string

  // Только sale-business
  tenantsInfo?: Partial<ObjectTenantsInfo[]>
  globalRentFlow?: {
    year: number
    mouth: number
  }

  // Только sale-business
  payback?: number

  price: ObjectPrice
  type: TypeObject
}

export type ObjectRequest = Omit<
  Object,
  "slug" | "info" | "tentantsInfo" | "price" | "type" | "panorama"
> & {
  // info
  infoSquare: number
  infoTypeWindow: string
  infoLayout: string
  infoCountEntrance?: number
  infoEnter: string
  infoCeilingHeight?: string
  infoFinishing: string
  infoFloor?: number
  infoForce: number
  infoGlazzing?: number
  infoHood: boolean

  // price
  priceSquare: number
  priceProfitability: number
  priceGlobal: number
  priceRentYear: number
  priceRentMouth: number

  // tentanst
  tenantsInfoRentFlowMount: number
  tenantsInfoRentFlowYear: number
  tenantsInfoDateContractRents: number

  // panorama
  panorama: `${"http:" | "https:"}${string}`
  // panoramaLat: number;
  // panoramaLon: number;

  // photos
  photos: Blob | Blob[]
  photosLayout: Blob | Blob[]
  tentantLogo?: Blob

  // only ready bussiness
  globalRentFlowYear: number
  globalRentFlowMouth: number

  isNew: boolean
}

export type ObjectCreateNewRequest = Pick<
  CustomRequestParams<ObjectRequest, Context["set"], StoreUpload>,
  "body" | "set" | "store"
>
export type ObjectTypeRequest = Pick<
  CustomRequestParams<
    never,
    Context["set"],
    never,
    Context["request"],
    { type: "sale" | "rent" | "hidden" }
  >,
  "request" | "set" | "params"
>
export type ObjectAddNewTenantRequest = Pick<
  CustomRequestParams<
    {
      tentants: ObjectTenantsInfo[]
    },
    Context["set"],
    Context["request"],
    Context["store"],
    { id: string }
  >,
  "body" | "set" | "params"
>
export type ObjectSlugRequest = Pick<
  CustomRequestParams<
    Context["body"],
    Context["set"],
    Context["request"],
    Context["store"],
    { slug: string }
  >,
  "body" | "params" | "set"
>
export type ObjectEditRequest = Pick<
  CustomRequestParams<
    Object,
    Context["set"],
    Context["request"],
    StoreUpload,
    { id: string }
  >,
  "body" | "params" | "set"
>
export type ObjectDeleteTentantInObject = Pick<
  CustomRequestParams<
    {
      tenatantId: string
    }[],
    Context["set"],
    Context["store"],
    Context["request"],
    {
      id: string
    }
  >,
  "body" | "params" | "set"
>
export type ObjectEditTentantsRequest = Pick<
  CustomRequestParams<
    ObjectTenantsInfo[],
    Context["set"],
    Context["store"],
    Context["request"],
    {
      id: string
    }
  >,
  "body" | "params" | "set"
>
