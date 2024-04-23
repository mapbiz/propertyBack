import slugify from "slugify";

export const slug = (string: string) => slugify(
   string,
   {  
      lower: true,
      replacement: "-",
      trim: true,
      remove: /[*+~.()'"!:@?!,:;\[\]\\|\/_-`]/gm,
   }  
)  