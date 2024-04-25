import slugify from "slugify";

slugify.extend({ 
   '#': 'grid',
   '@': 'at',
   '&': 'an',
   '%': 'percent',
   '$': 'dollar',
   ' ': 'unbreak-space',
   '^': 'carret',
   '№': 'index',
   '!': 'exclamation-point',
   '?': 'question-mark',
   '.': 'dot',
   ',': 'comma',
   '~': 'tilda',
   '`': 'e',
   '"': 'quot',
   [`'`]: 'apos',
})

export const slug = (string: string) => slugify(
   string,
   {  
      lower: true,
      replacement: "-",
      trim: true,
      strict: true,
      remove: /[*+~.()'"!:@?!,:;\[\]\\|\/_-`{}%]/gm,
   }  
)  