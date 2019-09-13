"use strict"

/*

    ButtonView

    A simple push button view with a TextView label.

*/

DomView.newSubclassNamed("ButtonView").newSlots({
    titleView: null,
    isEnabled: true,
}).setSlots({

    init: function () {
        DomView.init.apply(this)
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
    },

    setTitle: function(s) {
        this.titleView().setValue(s)
        return this
    },

    title: function() {
        return this.titleView().value()
    },

    setButtonHeight: function(h) {
        this.setMinAndMaxHeight(h)
        this.setLineHeight(h)
        return this
    },

    /*
    setIconName: function(aString) {
        this.setBackgroundImageUrlPath(this.pathForIconName(aString))
        return this
    },
    */

    setIsEditable: function(aBool) {
        this.titleView().setIsEditable(aBool)
        return this
    },

    isEditable: function() {
        return this.titleView().isEditable()
    },

    sendActionToTarget: function() {
        if (!this.isEditable()) {
            DomView.sendActionToTarget.apply(this)
        }
        return this
    },

    onTapComplete: function (aGesture) {
        //console.log(this.typeId() + ".onTapComplete()")
        if (!this.isEditable()) {
            DomView.sendActionToTarget.apply(this)
        }
        return false
    },
})
