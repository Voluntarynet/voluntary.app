

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
        })
    }

    registerClass (aClass) { // (aClass is a constructor) 
        this.classes()[aClass.type()] = aClass
        return this
    }
}

ClassManager.shared().registerClass(ProtoClass)