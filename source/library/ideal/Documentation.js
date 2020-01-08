"use strict"

/*

    Documentation

    An simple in-memory documentation system.
    
    TODO: Rename to something more unique.

*/

window.Documentation = class Documentation extends ProtoClass {
    initPrototype () {

    }

    init() {
        super.init()
    }

    classes () {
        return ProtoClass.allClasses()
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
                methods.push({ name: methodName, argNames: argNames, comments: v.extractComments() })
            }
        })
        return methods
    }

    asJson() {
        const classes = []
        this.classes().forEach((aClass) => {
            const classDict = {}
            classDict.name = aClass.type()
            const superclass = aClass.superClass()
            if (superclass.type) {
                classDict.superClass = superclass.type()
            }
            classes.push(classDict)
            classDict.methods = this.methodsDocsForClass(aClass)
            //classDict.comments = aClass.comments()
        })
        return classes
    }

    show() {
        const classes = this.asJson()
        const lines = []
        classes.forEach((aClass) => {
            lines.push(aClass.name + " : " + aClass.superClass)
            /*
            aClass.methods.forEach((aMethod) => {
                let argsString = ""
                if (aMethod.argNames.length > 0) {
                    argsString = "(" + aMethod.argNames.join(",") + ")"
                }
                lines.push("  - " + aMethod.name + argsString + " " + aMethod.comments)
            })
            */
        })
        /*
        const s = JSON.stringify(this.asJson(), 2, 2)
        */
        console.log("DOCUMENTATION:\n\n", lines.join("\n"))
    }
}.initThisClass()


/*
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

    extractComments: function() {
        const commentPattern = new RegExp("(\\/\\*([^*]|[\\r\\n]|(\\*+([^*\/]|[\\r\\n])))*\\*+\/)|(\/\/.*)", "g");
        return this.toString().match(commentPattern)
    },
})

*/