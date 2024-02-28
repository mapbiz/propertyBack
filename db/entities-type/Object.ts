import { Entity, Column, ObjectIdColumn, ObjectId } from "typeorm"; 

import { BaseEntity } from "./BaseEntity";
import { Image } from "./Image"; 

import type { Image } from "../../types/images.types";
import type { Object as ObjectType } from "../../types/object.types";

@Entity()
export class Object extends BaseEntity {
   @Column({ unique: true, nullable: false })
   public title: string;

   @Column(type => Image)
   public photos: Image | Image[];

   constructor({ title, photos }: ObjectType) {
      super();

      this.photos = photos;
      this.title = title;
   };
};