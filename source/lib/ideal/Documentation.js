"use strict"

/*

    Documentation

    An simple in-memory documentation system.
    
    TODO: Rename to something more unique.

*/

class Documentation extends ProtoClass {
    init() {
        super.init()
        this.newSlots({
            classes: [],
        })
    }

    registerClass(aClass) {
        const classes = this.classes()
        if (classes.contains(aClass)) {
            console.log("duplicate class ", aClass.type())
        }
        this.classes().push(aClass)
        console.log("registering class " + aClass.type() + " subclass of " + aClass.superClass().type())
    }

    asJson() {

    }
}

window.Documentation = Documentation

// --- Object category -------------------------------------

Object.prototype.docs = function() {
    if (!this._docs) {
        this._docs = {}
    }
    return this._docs
}

Object.prototype.setDocs = function (name, description) {
    const docs = this.docs()
    docs._name = methodName
    docs._description = description
    return this
}

// --- Function category -------------------------------------

Function.prototype.docs = function() {
    if (!this._docs) {
        this._docs = {}
    }
    return this._docs
}

Function.prototype.setDocs = function (name, description, returns) {
    const docs = this.docs()
    docs._name = name
    docs._description = description
    docs._returns = returns 
    return this
}
