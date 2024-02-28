import { ObjectIdColumn, ObjectId, Column } from "typeorm";

export abstract class BaseEntity {
   @ObjectIdColumn()
   _id!: ObjectId;

   @Column({ default: () => "NOW()" })
   createdAt = new Date();
};