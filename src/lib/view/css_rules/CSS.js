"use strict"

/*
    CSS Rule sets abstraction
    
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
            rules: {},
        })
        
        return this
    }
    
    hasRule (k) {
        return k in this.rules()
    }
    
    ruleAt (k) {
        var rule = this.rules()[k]
        if (!rule) {
            rule = CSSRuleSet.clone().setKey(k)
            this.rules()[k] = rule
        }
        return rule        
    }
    
    assertRuleExists (ruleName) {
        if (!this.hasRule(ruleName)) {
            throw new Error("CSS missing ruleset '" + ruleName + "'")
        }     
        return this   
    }
    
    applyEntryToElement (ruleName, anElement) {        
        this.assertRuleExists(ruleName)
        this.ruleAt(ruleName).applyToElement(anElement)
        return this
    }

    asJSON () {
        var dict = {}
        var rules = {}
        this.rules().forEach((k, ruleSet) => {
            rules[k] = ruleSet.asJSON()
        })
        dict.rules = rules
        return dict

    }

    fromJSON (json) {
        json.rules.forEach((k, v) => {
            this.ruleAt(k).fromJSON(v)
        })
    }
}
