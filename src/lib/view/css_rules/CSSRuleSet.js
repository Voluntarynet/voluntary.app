"use strict"

window.CSSRuleSet = class CSSRuleSet extends ProtoClass {
    init() {
        super.init()
        this.newSlots({
            declarations: {},
            key: null,
        })
    }
    
    decAt (k) {
        var dec = this.declarations()[k]
        if (!dec) {
            dec = CSSDeclaration.clone().setRuleSet(this).setKey(k)
            this.declarations()[k] = dec
        }
        return dec
    }

    applyToElement (anElement) {        
        var dict = this.declarations()
        
        Object.slotValues(dict).forEach(function(declaration) {
            declaration.applyToElement(anElement)
        })
        
        return this
    }
    
    setDict (dict) {
        Object.keys(dict).forEach((k) => {
            this.decAt(k).setValue(dict[k])
        })
        return this
    }

    asJSON () {
        var dict = {}
        dict.key = this.key()
        var decs = {}
        this.declarations().forEach((dec) => {
            decs[dec.key()] = dec.value()
        })
        dict.declarations = decs
        return dict

    }

    fromJSON (json) {
        this.setKey(json.key)
        json.declarations.forEach((k, v) => {
            this.decAt(k).setValue(v)
        })
    }
}

CSSRuleSet.registerThisClass()

