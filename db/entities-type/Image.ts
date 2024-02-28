import { Column, Entity } from "typeorm";
import { BaseEntity } from "./BaseEntity";

@Entity()
export class Image extends BaseEntity {
   @Column({ nullable: false })
   public url: string;

   constructor(url: string) {
      super();

      this.url = url;
   };
};