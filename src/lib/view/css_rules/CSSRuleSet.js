"use strict"

/*

    CSSRuleSet
         
*/

window.CSSRuleSet = class CSSRuleSet extends ProtoClass {
    init() {
        super.init()
        this.newSlots({
            declarations: {},
            key: null,
        })
    }

    /*
    getStyleSheet() {
        // enumerate sheets on document (items of type CSSStyleSheet)
        for (let i = 0; i < document.styleSheets.length; i++) {
            let mysheet = document.styleSheets[i];
            // enumerate rules on sheet (items of type RuleList)
            let myrules = mysheet.cssRules ? mysheet.cssRules : mysheet.rules;
            for (let j = 0; j < myrules.length; j++) {
                // enumerate rules in ruleList (items of type CSS*Rule, e.g. CSSFontFaceRule) 
                if (myrules[j].selectorText && myrules[j].selectorText.toLowerCase() === selector) {
                    return myrules[j].style[style];
                }
            }
        }
    }
    */
    
    decAt (k) {
        let dec = this.declarations()[k]
        if (!dec) {
            dec = CSSDeclaration.clone().setRuleSet(this).setKey(k)
            this.declarations()[k] = dec
        }
        return dec
    }

    applyToElement (anElement) {        
        let dict = this.declarations()
        
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
        let dict = {}
        dict.key = this.key()
        let decs = {}
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

    setupFromRawRule(aCSSStyleRule) {
        this.setKey(aCSSStyleRule.selectorText)
        return this
    }
}

CSSRuleSet.registerThisClass()

