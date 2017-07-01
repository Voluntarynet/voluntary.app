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

/// --------------------


CSSDeclaration = ideal.Proto.extend().newSlots({
    type: "CSSDeclaration",
    key: null,
    value: null,
    ruleSet: null,
}).setSlots({
    init: function() {
    },
    
    applyToElement: function(anElement) {
        anElement.style[this.key()] = this.value()
        if (this.key() == "left") {
            console.log("apply " + this.ruleSet().key() + " " + this.key() + ":" + this.value())
        }
        return this
    },
    
    set: function(key, value) {
        this.setKey(key)
        this.setValue(value)
        return this
    },

    setKey: function(k) {
       this._key = assertDefined(k)
       return this
    },
        
    setValue: function(v) {
       this._value = assertDefined(v)
       return this
    },
})

/// --------------------

CSSRuleSet = ideal.Proto.extend().newSlots({
    type: "CSSRuleSet",
    declarations: null,
    key: null,
}).setSlots({
    init: function() {
        this.setDeclarations({})
    },
    
    decAt: function(k) {
        var dec = this.declarations()[k]
        if (!dec) {
            dec = CSSDeclaration.clone().setRuleSet(this).setKey(k)
            this.declarations()[k] = dec
        }
        return dec
    },

    applyToElement: function(anElement) {        
        var dict = this.declarations()
        
        dict.slotValues().forEach(function(declaration) {
            declaration.applyToElement(anElement)
        })
        
        return this
    },
    
    setDict: function(dict) {
        for (var k in dict) {
            if (dict.hasOwnProperty(k)) {
                this.decAt(k).setValue(dict[k])
            }
        }
        return this
    },
})

/// --------------------

CSS = ideal.Proto.extend().newSlots({
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
})

/// --------------------

/*
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

CSS.ruleAt("BrowserColumnGroup").setDict({
    display: "flex",
    position: "relative",
    width: "100%",
    backgroundColor: "#333",
    color: "#777",
    textAlign: "center",
})

CSS.ruleAt("BrowserColumnEmptyLabel").setDict({
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",      
    width: "auto",
    height: "auto",
    backgroundColor: "transparent",
    zIndex: 11,
    textAlign: "center",
    border: "0px solid #aaa",
    fontFamily: "OpenSans-Regular",
    fontSize: "14px",
})

CSS.ruleAt("BrowserSharedHeader").setDict({
    position: "absolute",
    x: 0,
    y: 0,
    height: "40px",
    width: "100%",
    zIndex: 10,
    backgroundColor: "#dbdbdb",
    textAlign: "right",
})

CSS.ruleAt("BrowserHeader").setDict({
    position: "absolute",
    x: 0,
    y: 0,
    height: "40px",
    width: "100%",
    zIndex: 10,
    backgroundColor: "#dbdbdb",
    textAlign: "right",
})

CSS.ruleAt("BrowserHeaderAction").setDict({
    display: "inline-block",
    width: "28px",
    height: "14px",
    backgroundColor: "transparent",
    marginTop: "15px",
    marginRight: "15px",
    opacity: .9,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right center",
})

CSS.ruleAt("BrowserColumn").setDict({
    position: "relative",
    overflowY: "auto",
    flex: 1,
    top: "40px",
    width: "100%",
    // borderLeft: "1px solid #333",
})
*/

/* --- Browser Row --- */

/*
CSS.ruleAt("BrowserRow").setDict({
    fontFamily: "OpenSans-Regular",
    display: "block",
    position: "relative",
    opacity: .8,
    width: "100%",
    height: "60px",
    color: "#CBCBCB",
    borderBottom: "0px solid #ddd",
    transition: "backgroundColor .3s ease-out",
})

CSS.ruleAt("BrowserRow_Selected").setDict({
    fontFamily: "OpenSans-Regular",
    display: "block",
    position: "relative",
    opacity: 1,
    width: "100%",
    height: "60px",
    borderBottom: "0px solid #ddd",
    transition: "backgroundColor .3s ease-out",
    color: "#fff",
})

CSS.ruleAt("BrowserRowTitle_NoSubtitle").setDict({
    position: "absolute",
    top: "22px",
    left: "20px",
    fontSize: "13px",
    fontWeight: "normal",
    whiteSpace: "nowrap",
})

CSS.ruleAt("BrowserRowTitle").setDict({
    minWidth: "100px",
    textAlign: "left",
    
    position: "absolute",
    top: "10px",
    left: "20px",
    fontSize: "13px",
    fontWeight: "normal",
    whiteSpace: "nowrap",
    textTransform: "none",
})

CSS.ruleAt("BrowserRowTitle_Selected").setDict({
    minWidth: "100px",
    textAlign: "left",
    color: "#fff",
    opacity: 1,
    position: "absolute",
    left: "20px",
    top: "10px",
    fontSize: "13px",
    fontWeight: "normal",
    whiteSpace: "nowrap",
    textTransform: "none",
})

CSS.ruleAt("BrowserRowSubtitle").setDict({
    fontFamily: "OpenSans-Light",
    position: "absolute",
    opacity: .8,
    left: "20px",
    top: "30px",
    fontSize: "11px",
    fontWeight: "normal",
    whiteSpace: "nowrap",
})

CSS.ruleAt("BrowserRowSubtitle_Selected").setDict({
    fontFamily: "OpenSans-Light",
    position: "absolute",
    opacity: 1,
    left: "20px",
    top: "30px",
    fontSize: "11px",
    fontWeight: "normal",
    whiteSpace: "nowrap",
})

CSS.ruleAt("BrowserRowNote").setDict({
    fontFamily: "OpenSans-Light",
    position: "absolute",
    right: "20px",
    top: "24px",
    fontSize: "11px",
    fontWeight: "normal",
    whiteSpace: "nowrap",
})

*/

/* --- BrowserFieldRow --- */

/*
CSS.ruleAt("BrowserFieldRow").setDict({
    backgroundColor: "#fff",
    opacity: 1,
    
    fontFamily: "OpenSans-Regular",
    display: "block",
    position: "relative",
    width: "100%",
    height: "60px",
    color: "#CBCBCB",
    borderBottom: "1px solid #ddd",
    transition: "backgroundColor .3s ease-out",
})

CSS.ruleAt("BrowserFieldRowTitle").setDict({
    color: "#999",
    fontFamily: "OpenSans-Regular",
    
    minWidth: "100%",
    textAlign: "left",
    
    position: "absolute",
            
    top: "22px",
    left: "88px",
    fontSize: "13px",
    fontWeight: "normal",
    whiteSpace: "nowrap",
    textTransform: "none",
    backgroundColor: "#aaa"
})

CSS.ruleAt("BrowserFieldRowSubtitle").setDict({
    color: "#000",
    fontFamily: "OpenSans-Regular",
    position: "absolute",
    opacity: .8,
    top: "22px",
    width: "80px",
    textAlign: "right",
    fontSize: "13px",
    fontWeight: "bold",
    whiteSpace: "nowrap",
    textTransform: "capitalize",
})


CSS.ruleAt("BrowserFieldRowNote").setDict({
    fontFamily: "OpenSans-Light",
    position: "absolute",
    right: "20px",
    top: "24px",
    fontSize: "11px",
    fontWeight: "normal",
    whiteSpace: "nowrap",
})
*/
