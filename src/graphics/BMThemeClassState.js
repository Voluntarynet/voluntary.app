"use strict"

window.BMThemeClassState = BMFieldSetNode.extend().newSlots({
    type: "BMThemeClassState",
}).setSlots({
    init: function () {
        BMFieldSetNode.init.apply(this)
        this.setShouldStore(true)

        this.setSubtitle("state")
        this.setNodeMinWidth(200)

        this.setupSubnodes()
    },

  
    setupSubnodes: function() {

        var field = BMBoolField.clone().setKey("isDark").setValueIsEditable(true);
        this.addStoredField(field)
        /*
        //Toggle Hook
        BMFieldSetNode.didUpdateField = function (aField) {
            if (aField.key() == "altScrollbars") {
                aField.parentNode().toggleAltScrollbars()
            }
        }
        */

        return this
    },


    didUpdateField: function(aField) {
        console.log("didUpdateField: ", aField.value())
        // note: this is just a test at the moment
        // todo: use aField attributes for class and attribute name

        if (aField.value()) { // dark mode
            //BrowserDefaultHeader.clone().setCssClassAttribute("background", "black")
            BrowserHeader.clone().setCssClassAttribute("background", "#999")
            BrowserColumn.clone().setCssClassAttribute("background", "black")
            BrowserColumn.clone().setCssClassAttribute("border-left", "10px solid white")
            BMTextAreaFieldRowView.clone().setCssClassAttribute("background", "black")
        } else {
            //BrowserDefaultHeader.clone().setCssClassAttribute("background", "#aaa")
            BrowserHeader.clone().setCssClassAttribute("background", "#dbdbdb")
            BrowserColumn.clone().setCssClassAttribute("background", "transparent")
            BrowserColumn.clone().setCssClassAttribute("border-left", "0px solid white")
            BMTextAreaFieldRowView.clone().setCssClassAttribute("background", "white")
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
