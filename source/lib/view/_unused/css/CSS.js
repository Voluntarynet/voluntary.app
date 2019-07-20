"use strict"

/*

    IMPORTANT:

        Browsers block JS access to CSS so this model won't work.
        We'll need to set all element's style directly if we want full control over
        styling from JS. Hopefully, this won't be a performance issue... :(


    CSS Rule sets abstraction
    
    CSS structure in JS is:

        DOCUMENT:
        document

        SHEETS: 
        StyleSheetList sheets = document.styleSheets 

        SHEETS: 
        CSSStyleSheet sheet = sheets[i]

        RULELIST:
        CSSRuleList ruleList = sheet.cssRules

        RULE:
        CSS*Rule rule = ruleList[i]

        STYLE DECLARATION:
        CSSStyleDeclaration styleDec = rule.style

        PROPERTIES:
        styleDec.fontFamily
        ...


    example use:
    
    // define a rule set
    
    CSS.ruleAt("Browser").setDict({
        overflow: "hidden",
        position: "absolute",
        top: "0px",
        right: 0,
        bottom: 0,
        left: 0,
        paddingTop: "40px",
        display: "flex"
    })
    
    // update a declaration
    
    CSS.ruleAt("Browser").decAt("position").setValue("relative")
    
    // apply a rule
    
    CSS.ruleAt("Browser").applyToElement(e)

*/
  

window.CSS = class CSS extends ProtoClass {
    init() {
        super.init()
        this.newSlots({
            sheets: [],
            rules: [],
        })
        
        this.syncFromDocument()

        return this
    }

    syncFromDocument() {
        const sheets = document.styleSheets; // sheets is a StyleSheetList
        for (let i = 0; i < sheets.length; i ++) {
            const sheet = sheets[i] // sheet is a CSSStyleSheet
            const cssSheet = CSSSheet.clone().setSheetRef(sheet)
        }
    }
    
    hasRule (k) {
        return this.rules().detect(rule => rule.name() === k)
    }

    asJSON () {
        const cssJson = {}
        const jsonSheets = []
        this.sheets().forEach((sheet) => {
            json.push(sheet.asJSON())
        })
        cssJson.jsonSheets = jsonSheets
        return cssJson

    }

    fromJSON (json) {
        json.rules.forEach((k, v) => {
            this.ruleAt(k).fromJSON(v)
        })
    }

    /*
    setupFromCSS() {
        // enumerate sheets on document (items of type CSSStyleSheet)
        for (let i = 0; i < document.styleSheets.length; i++) {
            let mysheet = document.styleSheets[i];

            // enumerate rules on sheet (c type RuleList)
            let myrules = mysheet.cssRules ? mysheet.cssRules : mysheet.rules;
            // enumerate rules in ruleList (items of type CSS*Rule, e.g. CSSFontFaceRule) 
            for (let j = 0; j < myrules.length; j++) {
                let rule = myrules[j]
                let className = rule.selectorText
                let ruleObj = this.ruleAt(className)
                ruleObj.setupFromRawRule(rule)
            }
        }
    }
    */

    rawCSSStyleRuleForClassName (className) {
        // enumerate sheets on document (items of type CSSStyleSheet)
        for (let i = 0; i < document.styleSheets.length; i++) {
            const mysheet = document.styleSheets[i];

            // enumerate rules on sheet (c type RuleList)
            const myrules = mysheet.cssRules ? mysheet.cssRules : mysheet.rules;
            // enumerate rules in ruleList (items of type CSS*Rule, e.g. CSSFontFaceRule) 
            for (let j = 0; j < myrules.length; j++) {
                const rule = myrules[j]
                if(className === rule.selectorText) {
                    return rule // usually a CSSStyleRule instance
                }
            }
        }

    }
}

window.CSS.registerThisClass()

window.CSS.shared()