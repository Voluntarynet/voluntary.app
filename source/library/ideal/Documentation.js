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
        //console.log("registering class " + aClass.type() + " subclass of " + aClass.superClass().type())
    }

    methodsDocsForClass(aClass) {
        const methods = []
        Object.getOwnPropertyNames(aClass).forEach((methodName) => {
            const v = aClass[methodName]
            //const docs = v._docs
            if (Type.isFunction(v) && methodName !== "constructor") {
                const source = v.toString()
                let argNames = source.after("(").before(")").split(",").map(s => s.trim())
                if (argNames[0] === "") { 
                    argNames = [] 
                }
                methods.push({ name: methodName, argNames: argNames})
            }
        })
        return methods
    }

    asJson() {
        const classes = []
        this.classes().forEach((aClass) => {
            const classDict = {}
            classDict.name = aClass.type()
            classDict.superClass = aClass.superClass().type()
            classes.push(classDict)
            classDict.methods = this.methodsDocsForClass(aClass)
        })
        return classes
    }

    show() {
        const classes = this.asJson()
        const lines = []
        classes.forEach((aClass) => {
            lines.push(aClass.name + ":" + aClass.superClass)
            aClass.methods.forEach((aMethod) => {
                let argsString = ""
                if (aMethod.argNames.length > 0) {
                    argsString = "(" + aMethod.argNames.join(",") + ")"
                }
                lines.push("  - " + aMethod.name + argsString)
            })
        })
        /*
        const s = JSON.stringify(this.asJson(), 2, 2)
        */
        console.log(this.type() + ".show() = ", lines.join("\n"))
    }
}

window.Documentation = Documentation

// --- Object category -------------------------------------

Object.defineSlots(Object.prototype, {

    docs: function() {
        if (!this._docs) {
            this._docs = {}
        }
        return this._docs
    },

    setDocs: function (name, description) {
        const docs = this.docs()
        docs._name = methodName
        docs._description = description
        return this
    },
    
})

// --- Function category -------------------------------------

Object.defineSlots(Function.prototype, {

    docs: function() {
        if (!this._docs) {
            this._docs = {}
        }
        return this._docs
    },

    setDocs: function (name, description, returns) {
        const docs = this.docs()
        docs._name = name
        docs._description = description
        docs._returns = returns 
        return this
    },

})
