"use strict"

window.BMThemeClassState = BMFieldSetNode.extend().newSlots({
    type: "BMThemeClassState",
}).setSlots({
    init: function () {
        BMFieldSetNode.init.apply(this)
        this.setShouldStore(true)
        //this.setSubtitle("state")
        this.setNodeMinWidth(200)
        this.setupSubnodes()
    },

    divClassName: function() {
        return this.parentNode().title()
    },

    attributeNames: function() {
        // todo: request this from the view class, use view class theme state methods instead of direct css keys
        return ["background", "color", "border"]
    },

    setupSubnodes: function() {
        this.attributeNames().forEach((attributeName) => {
            var field = BMBoolField.clone().setKey(attributeName).setValueIsEditable(true);
            this.addStoredField(field)
        })
        return this
    },

    didUpdateField: function(aField) {
        console.log(this.type() + ".didUpdateField: " + aField.key() + ":", aField.value())

        var divClassName = this.parentNode().title()

        if (aField.value()) { // dark mode
            BMThemeStyleSheet.shared().setDivClassNameAttributeValue(divClassName, aField.key(), "#000")
        } else {
            BMThemeStyleSheet.shared().setDivClassNameAttributeValue(divClassName, aField.key(), "white")
        }
    },
})

/* 
notes on Scroll bars theme options
::-webkit-scrollbar { width: 10px; } 
::-webkit-scrollbar-track { background: #666; } 
::-webkit-scrollbar-thumb { background-color: #f1f1f1; outline: 1px solid slategrey; } 
::-webkit-scrollbar-thumb:hover { background: #b1b1b1; }
*/
