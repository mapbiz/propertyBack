import { Entity, Property } from "@mikro-orm/mongodb";

import { BaseEntity } from "./BaseEntity.ts";


@Entity()
export class Admin extends BaseEntity {
   @Property({
      unique: true,
      nullable: false,
   })
   public login: string;

   @Property({
      unique: false,
      nullable: false
   })
   public password: string;


   constructor({
      login,
      password,
   }: { login: string, password: string }) {
      super();

      this.login = login;
      this.password = password;
   };
};