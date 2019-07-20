"use strict"

window.CSSSheet = class CSSSheet extends ProtoClass {
    init() {
        super.init()
        this.newSlots({
            sheetRef: null,
            rules: [],
        })
        
        return this
    }
    
    setSheetRef(ref) {
        this._sheetRef = ref
        this.read()
    }

    read() {
        const rulesRef = this.sheetRef().rules // can't access because Browsers block this for "security" reasons...

    }
}

//window.CSS.registerThisClass()

