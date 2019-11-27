"use strict"

/*

    ButtonView

    A simple push button view with a TextView label.

*/

window.ButtonView = class ButtonView extends DomView {
    
    initPrototype () {
        this.newSlots({
            titleView: null,
            isEnabled: true,
        })
    }

    init () {
        super.init()
        //this.setMinAndMaxWidth(200)
        //this.setButtonHeight(50)
        this.turnOffUserSelect()
        this.setTextAlign("center")
        this.setVerticalAlign("middle")
        
        this.setTitleView(TextField.clone())
        this.addSubview(this.titleView())
        this.titleView().fillParentView()
        this.setTitle("")

        /*
        this.setIconName("close")
        this.setBackgroundSizeWH(10, 10) // use "contain" instead?
        this.setBackgroundPosition("center")
        this.makeBackgroundNoRepeat()
        this.setAction("close") //.setInnerHTML("&#10799;")
        */

        this.addDefaultTapGesture()

        return this
    }

    setTitle (s) {
        this.titleView().setValue(s)
        return this
    }

    title () {
        return this.titleView().value()
    }

    setButtonHeight (h) {
        this.setMinAndMaxHeight(h)
        this.setLineHeight(h)
        return this
    }

    /*
    setIconName (aString) {
        this.setBackgroundImageUrlPath(this.pathForIconName(aString))
        return this
    }
    */

    setIsEditable (aBool) {
        this.titleView().setIsEditable(aBool)
        return this
    }

    isEditable () {
        return this.titleView().isEditable()
    }

    sendActionToTarget () {
        if (!this.isEditable()) {
            DomView.sendActionToTarget.apply(this)
        }
        return this
    }

    onTapComplete  (aGesture) {
        //this.debugLog(".onTapComplete()")
        if (!this.isEditable()) {
            DomView.sendActionToTarget.apply(this)
        }
        return false
    }
    
}.initThisClass()
