import slugify from "slugify";

slugify.extend({ 
   '#': 'grid',
   '@': 'at',
   '&': 'an',
   '%': 'percent',
   '$': 'dollar',
   ' ': 'unbreak-space',
})

export const slug = (string: string) => slugify(
   string,
   {  
      lower: true,
      replacement: "-",
      trim: true,
      remove: /[*+~.()'"!:@?!,:;\[\]\\|\/_-`{}%]/gm,
   }  
)  