"use strict"

/*
    working on moving Proto to ES6 classes

    problems and potential solutions:

    P: auto setter and getters on _variables
    S: call newSlots in init? What about introspection?

    P: inheriting proto ivars?
    S: ?

    P: protos as singletons?
    S: always use ClassName.shared()?

    P: interactively changing protos?
    S: ?

*/

class BaseObject { 
    constructor() {
    }

    static clone() {
        var obj = new this()
        return obj
    }

    type() {
        return this.constructor.name
    }

}


var test = BaseObject.clone()
console.log("test = ", test)
console.log("test.pop = ", test.pop)

