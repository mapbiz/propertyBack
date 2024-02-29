import slugify from "slugify";

export const slug = (string: string) => slugify(
   string,
   {  
      locale: 'ru',
      lower: true,
      replacement: "-",
   }
)