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


window.CSS = ideal.Proto.extend().newSlots({
    type: "CSS",
    rules: {},
}).setSlots({
    shared: function() {
        return this
    },
    
    hasRule: function(k) {
        return k in this.rules()
    },
    
    ruleAt: function(k) {
        var rule = this.rules()[k]
        if (!rule) {
            rule = CSSRuleSet.clone().setKey(k)
            this.rules()[k] = rule
        }
        return rule        
    },
    
    assertRuleExists: function(ruleName) {
        if (!this.hasRule(ruleName)) {
            throw new Error("CSS missing ruleset '" + ruleName + "'")
        }     
        return this   
    },
    
    applyEntryToElement: function(ruleName, anElement) {        
        this.assertRuleExists(ruleName)
        this.ruleAt(ruleName).applyToElement(anElement)
        return this
    },

    asJSON: function() {
        var dict = {}
        var rules = {}
        this.rules().forEach((k, ruleSet) => {
            rules[k] = ruleSet.asJSON()
        })
        dict.rules = rules
        return dict

    },

    fromJSON: function(json) {
        json.rules.forEach((k, v) => {
            this.ruleAt(k).fromJSON(v)
        })
    },
})
