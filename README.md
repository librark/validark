# Validarkjs

Simple Data Validation Library

## Usage

Call the **validate** method with the required *schema* and the *records*
to be validated:

    import { validate } from validark

    const schema = {
        "*name": String,
        "age": parseInt
    }

    const records = [{
        "name": "Pepito Pérez",
        "age": 64
    }]

    const [result] = validate(schema, records)

    console.assert(result === value)


Schemas are just objects whose keys are strings and whose records are
validation callables, objects or arrays. e.g.:

    const schema = {
        "color": String,
        "width": parseInt,
        "height": parseInt,
        "weight": parseFloat,
        "duration": (v) => (v >= 0 && v <= 59) && v || 0
        "contact": {
            "phone": String,
            "email": (v) => v.contains('@') && v || ''
        }
    }

**Validation callables** must receive their keys' corresponding input value and
return the final value that will be assigned to such key. If an **Error**
is received, it will be thrown:

    const schema = {
        "name": String,
        "age": (v) => (v > 0 && v < 130) && v || new Error("Invalid Age!")
    }

    const message = None

    try {
        const records = [{"name": "John Doe", "age": 200}]
        const [result] = validate(schema, records)
    } catch (error) {
        const message = String(error)
    }

    console.assert(message === "Error: Invalid Age!")

Mandatory fields can be marked with an **asterix (*)** as key prefix:

    const schema = {
        "title": String,
        "*firstname": String,
        "*surname": String,
    }

Aliases can be delimited with **:=**. The final key will be the leftmost entry:

    const schema = {
        "*first_name:=firstname:=firstName": String,
        "*last_name:=lastname:=lastName": String
    }

    const records = [
        {"firstName": "Clark", "lastName": "Kent"},
        {"firstname": "Peter", "lastname": "Parker"},
        {"first_name": "Bruce", "last_name": "Wayne"}
    ]

    const result = validate(schema, records)

    console.assert(result === [
        {"first_name": "Clark", "last_name": "Kent"},
        {"first_name": "Peter", "last_name": "Parker"},
        {"first_name": "Bruce", "last_name": "Wayne"}
    ])

Extra keys in the records' entries are ignored and aliases definitions are
processed from right to left if there are multiple matches:

    const schema = {
        "*name": String,
        "*player_id:=playerId": String,
        "*score:=totalScore:=points": parseInt
    }

    const records = [
        {"name": "James", "playerId": "007", "totalScore": 99, "points": 55}
    ]

    const [result] = validate(schema, records)

    console.assert(result === {
        "name": "James", "player_id": "007", "score": 99
    })

Sequences of items might be handled by defining the **validation function
inside an array**:

    const schema = {
        "levels": [String],
        "addresses": [
            {'*street': String, 'city': String}
        ]
    }

    const records = [{
        "levels": [1, 2, 3],
        "addresses": [
            {"street": '5th Ave 45', "city": "Popeland"},
            {"street": '7th Street 67', "city": "Churchland"}
        ]
    }]

    const [result] = validate(schema, records)

    console.assert(result === {
        "levels": ["1", "2", "3"],
        "addresses": [
            {"street": '5th Ave 45', "city": "Popeland"},
            {"street": '7th Street 67', "city": "Churchland"}
        ]
    })

## Utilities

Validark includes several utility functions to simplify common validation
scenarios.

### check

The *check()* function behaves similarly to the *assert()* function in NodeJS.
However, this function is provided as a convenient multi-environment utility.
*check()* returns the provided value if it is *truthy*.

    const value = 'Truthy Value'

    const result = check(value)

    const [result] = validate(schema, records)

    console.assert(result === value)

In the other hand, if the value provided to check is *falsy*, it raises an
error with the optional provided message.

    const value = undefined

    try {
      check(value, 'Invalid Value!')
    } catch (error) {
      const message = String(error)
    }

    console.assert(message === "check failed. Invalid Value!")

Or called without arguments:

    try {
      check()
    } catch (error) {
      const message = String(error)
    }

    console.assert(message === "check failed.")
