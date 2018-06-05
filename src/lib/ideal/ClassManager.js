

/*
    ClassManager
    a shared instance used to register the existence of classes
    this is a hack to get around Javascript's lack of a class namespace or
    any introspection into which classes exist outside of a brute force search

    example use:

    [ after declaring a class ]

    ClassManager.shared().addClass(MyClass)
*/

class ClassManager extends ProtoClass {
    init() {
        super.init()
        this.newSlots({
            "classes": {},           
            "allProtos": {}, 
            "uniqueIdCounter": 0,          
        })
    }

    registerClass (aClass) { // (aClass is a constructor) 
        this.classes()[aClass.type()] = aClass
        return this
    }

    registerProto (aProto) { // (aClass is a constructor) 
        this.allProtos()[aProto.type()] = aProto
        return this
    }

    newUniqueInstanceId () {
        this.setUniqueIdCounter(this.uniqueIdCounter() + 1)
        return this.uniqueIdCounter()
    }

}

ClassManager.shared().registerClass(ProtoClass)