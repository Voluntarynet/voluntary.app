"use strict"

window.BMGraphics = BMFieldSetNode.extend().newSlots({
    type: "BMGraphics",
    shared: null,
    isDark: true,
}).setSlots({
    init: function () {

        BMStorableNode.init.apply(this)

        this.setTitle("Graphics")
        this.setSubtitle("")
        this.setNodeMinWidth(200)

        var scrollbarToggle = BMBoolField.clone().setKey("isDark").setValueIsEditable(true);
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
        // note: this is just a test at the moment
        // todo: use aField attributes for class and attribute name

        if (aField.value()) {
            //BrowserDefaultHeader.clone().setCssClassAttribute("background", "black")
            BrowserHeader.clone().setCssClassAttribute("background", "#aaa")
            BrowserColumn.clone().setCssClassAttribute("background", "black")
            BrowserColumn.clone().setCssClassAttribute("border-left", "10px solid white")
        } else {
            //BrowserDefaultHeader.clone().setCssClassAttribute("background", "#aaa")
            BrowserHeader.clone().setCssClassAttribute("background", "#ccc")
            BrowserColumn.clone().setCssClassAttribute("background", "transparent")
            BrowserColumn.clone().setCssClassAttribute("border-left", "0px solid white")
        }

        /*
        Scroll bars 
        ::-webkit-scrollbar { width: 10px; } 
        ::-webkit-scrollbar-track { background: #666; } 
        ::-webkit-scrollbar-thumb { background-color: #f1f1f1; outline: 1px solid slategrey; } 
        ::-webkit-scrollbar-thumb:hover { background: #b1b1b1; }
        */
    },

    /*
    toggleAltScrollbars: function () {
        CSS.ruleAt("Browser").decAt("position").setValue("relative")
        CSS.rawCSSStyleRuleForClassName("Browser")
        //Activate stylesheet or theme or something
    },
    */
})
