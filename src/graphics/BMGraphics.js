"use strict"

window.BMGraphics = BMFieldSetNode.extend().newSlots({
    type: "BMGraphics",
    shared: null,
    altScrollbars: true,
    scrollbarCssElement: null,
}).setSlots({
    init: function () {

        BMStorableNode.init.apply(this)

        this.setTitle("Graphics")
        this.setSubtitle("")
        this.setNodeMinWidth(200)

        var scrollbarToggle = BMBoolField.clone().setKey("altScrollbars").setValueIsEditable(true);
        this.addStoredField(scrollbarToggle)

        /*
        //Toggle Hook
        BMFieldSetNode.didUpdateField = function (aField) {
            if (aField.key() == "altScrollbars") {
                aField.parentNode().toggleAltScrollbars()
            }
        }
        */
    },

    didUpdateField: function(aField) {
        console.log(this.type() + ".didUpdateField()")
        CSS.shared().rawCSSStyleRuleForClassName("BrowserView").background = "white"
    },

    /*
    toggleAltScrollbars: function () {
        CSS.ruleAt("Browser").decAt("position").setValue("relative")
        CSS.rawCSSStyleRuleForClassName("Browser")
        //Activate stylesheet or theme or something
    },
    */
})
