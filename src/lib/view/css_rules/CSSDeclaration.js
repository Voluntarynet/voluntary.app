"use strict"

/*
    move to styleSheets implementation, e.g.:
         
         document.styleSheets[0].addRule(newRuleKey, newRuleValue);
         
*/

window.CSSDeclaration = class CSSDeclaration extends ProtoClass {
    init() {
        super.init()
        this.newSlots({
            key: null,
            value: null,
            ruleSet: null,
        })
    }
    
    applyToElement (anElement) {
        anElement.style[this.key()] = this.value()
        if (this.key() == "left") {
            console.log("apply " + this.ruleSet().key() + " " + this.key() + ":" + this.value())
        }
        return this
    }
    
    set (key, value) {
        this.setKey(key)
        this.setValue(value)
        return this
    }

    setKey (k) {
        this._key = assertDefined(k)
        return this
    }
        
    setValue (v) {
        this._value = assertDefined(v)
        return this
    }

    setFromStyleDeclaration (cssStyleDec) {
        
        return this
    }
}

CSSDeclaration.registerThisClass()
