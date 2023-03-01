import core from './core.js' 
import applicator from './applicator.js' 
import validation from './validation.js' 
import unevaluated from './unevaluated' 

export const vocabularies = {
    "https://json-schema.org/draft/2020-12/vocab/core": core,
    "https://json-schema.org/draft/2020-12/vocab/applicator": applicator,
    "https://json-schema.org/draft/2020-12/vocab/validation": validation,
    "https://json-schema.org/draft/2020-12/vocab/unevaluated": unevaluated,
}
