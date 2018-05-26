"use strict"

class BaseObject { 
    static clone() {
        var obj = new this()
        return obj
    }

    constructor() {
    }

    type() {
        return this.constructor.name
    }

}