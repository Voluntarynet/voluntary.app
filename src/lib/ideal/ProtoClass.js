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

class ProtoClass { 
    static shared() {
        if (!this._shared) {
            this._shared = this.clone()
        }
        return this._shared
    }

    constructor() {
    }

    static clone() {
        var obj = new this()
        obj.init()
        return obj
    }
    
    init() {
        // subclasses should override to initialize
    }

    static type() {
        return this.name
    }

    type() {
        return this.constructor.name
    }

    newSlot(slotName, initialValue) {
        if (typeof (slotName) != "string") throw "name must be a string";

        if (initialValue === undefined) { initialValue = null };

        var privateName = "_" + slotName;
        this[privateName] = initialValue;

        if (!this[slotName]) {
            this[slotName] = function () {
                return this[privateName];
            }
        }

        var setterName = "set" + slotName.capitalized()

        if (!this[setterName]) {
            this[setterName] = function (newValue) {
                //this[privateName] = newValue;
                this.updateSlot(slotName, privateName, newValue);
                return this;
            }
        }

        return this;
    }

    newSlots(slots) {
        Object.eachSlot(slots,  (slotName, initialValue) => {
            this.newSlot(slotName, initialValue);
        });

        return this;
    }


    updateSlot(slotName, privateName, newValue) {
        var oldValue = this[privateName];
        if (oldValue != newValue) {
            this[privateName] = newValue;
            this.didUpdateSlot(slotName, oldValue, newValue)
            //this.mySlotChanged(name, oldValue, newValue);
        }

        return this;
    }

    didUpdateSlot(slotName, oldValue, newValue) {
        // persistence system can hook this
    }
}

/*
class MyByteArray extends ProtoClass {
    init() {
        super.init()
        console.log(this.type() + ".init() !")
        this.newSlot("foo", 0)
    }

}


var test = ProtoClass.clone()
console.log("test = ", test)
console.log("test.type() = ", test.type())


test = MyByteArray.clone()
console.log("test = ", test)
console.log("test.foo() = ", test.foo())

*/

//console.log("ProtoClass = ", ProtoClass)
//console.log("window.ProtoClass = ", window.ProtoClass)
