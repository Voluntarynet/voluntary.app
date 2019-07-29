"use strict"

/*

    BMThemeClassState

*/

BMFieldSetNode.newSubclassNamed("BMThemeClassState").newSlots({
    divClassName: null,
}).setSlots({
    init: function () {
        BMFieldSetNode.init.apply(this)
        this.setShouldStore(true)
        //this.setSubtitle("state")
        this.setNodeMinWidth(200)
        this.setupSubnodes()
    },

    attributeNames: function() {
        // TODO: request this from the view class, use view class theme state methods instead of direct css keys
        //return ["background", "color", "border"] 
        return BMViewStyle.styleNames()
    },

    setDivClassName: function(aName) {
        this._divClassName = aName
        this.setTitle(aName)
        let style = DomCSSInspector.shared().setDivClassName(aName).cssStyle()
        this.syncFromViewStyle()
        return this
    },

    syncFromViewStyle: function() {
  
        return this
    },

    setupSubnodes: function() {
        this.attributeNames().forEach((attributeName) => {
            let field = BMField.clone().setKey(attributeName).setValueIsEditable(""); // TODO: no .setValueMethod()??
            this.addStoredField(field)
        })
        return this
    },

    didUpdateField: function(aField) {
        console.log(this.typeId() + ".didUpdateField: " + aField.key() + ":", aField.value())

        if (aField.value()) { // dark mode
            BMThemeStyleSheet.shared().setDivClassNameAttributeValue(this.divClassName(), aField.key(), "#000")
        } else {
            BMThemeStyleSheet.shared().setDivClassNameAttributeValue(this.divClassName(), aField.key(), "white")
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
