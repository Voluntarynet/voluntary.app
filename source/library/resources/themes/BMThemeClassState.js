"use strict"

/*

    BMThemeClassState

*/

window.BMThemeClassState = class BMThemeClassState extends BMFieldSetNode {
    
    initPrototype () {
        this.newSlot("divClassName", null)
    }

    init () {
        super.init()
        this.setShouldStore(true)
        //this.setSubtitle("state")
        this.setNodeMinWidth(200)
        this.setupSubnodes()
    }

    attributeNames () {
        // TODO: request this from the view class, use view class theme state methods instead of direct css keys
        //return ["background", "color", "border"] 
        return BMViewStyle.styleNames()
    }

    setDivClassName (aName) {
        this._divClassName = aName
        this.setTitle(aName)
        const style = DomCSSInspector.shared().setDivClassName(aName).cssStyle() // needed?
        this.syncFromViewStyle()
        return this
    }

    syncFromViewStyle () {
  
        return this
    }

    setupSubnodes () {
        this.attributeNames().forEach((attributeName) => {
            const field = BMField.clone().setKey(attributeName).setValueIsEditable(""); // TODO: no .setValueMethod()??
            this.addStoredField(field)
        })
        return this
    }

    didUpdateField (aField) {
        this.debugLog(".didUpdateField: " + aField.key() + ":", aField.value())

        if (aField.value()) { // dark mode
            BMThemeStyleSheet.shared().setDivClassNameAttributeValue(this.divClassName(), aField.key(), "#000")
        } else {
            BMThemeStyleSheet.shared().setDivClassNameAttributeValue(this.divClassName(), aField.key(), "white")
        }
    }
    
}.initThisClass()

/* 
notes on Scroll bars theme options
::-webkit-scrollbar { width: 10px; } 
::-webkit-scrollbar-track { background: #666; } 
::-webkit-scrollbar-thumb { background-color: #f1f1f1; outline: 1px solid slategrey; } 
::-webkit-scrollbar-thumb:hover { background: #b1b1b1; }
*/
