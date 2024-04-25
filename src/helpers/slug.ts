import slugify from "slugify";

slugify.extend({ 
   '#': '',
   '@': '',
   '&': '',
   '%': '',
   '$': '',
   ' ': '',
   '^': '',
   '№': '',
   '!': '',
   '?': '',
   '.': '',
   ',': '',
   '~': '',
   '`': '',
   '"': '',
   [`'`]: '',
   '|': '',
   '\\': '',
   '\/': '',
})

export const slug = (string: string) => slugify(
   string,
   {  
      lower: true,
      replacement: "-",
      trim: true,
      strict: true,
      remove: /[*+~.()'"!:@?!,:;\[\]\\|\/_-`{}%^#&\$\ №"']/gm,
   }  
)  