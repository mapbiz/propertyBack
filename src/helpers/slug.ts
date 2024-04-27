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
   '0': '0',
})


export const slug = (string: string) => slugify(
   string,
   {  
      locale: 'ru',
      lower: true,
      replacement: "-",
      //trim: true,
      // strict: true,
      remove: /[*+~.()'"!:@?!,:;\[\]\\|\/_-`{}%^#&\$№"']/gm,
   },
)