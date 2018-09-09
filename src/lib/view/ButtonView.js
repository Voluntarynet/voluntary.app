
window.ButtonView = DivView.extend().newSlots({
    type: "ButtonView",
    isEnabled: true,
}).setSlots({

    init: function () {
        DivView.init.apply(this)
        this.setInnerHTML("button")
        this.setMinAndMaxWidth(200)
        this.setButtonHeight(50)
        this.turnOffUserSelect()
        this.setBorder("1px solid black")
        this.setBackgroundColor("#ccc")
        this.setTextAlign("center")
        this.setVerticalAlign("middle")
        //this.setDivClassName("ButtonView")
        /*
        this.setIconName("close")
        this.setBackgroundSizeWH(10, 10) // use "contain" instead?
        this.setBackgroundPosition("center")
        this.makeBackgroundNoRepeat()
        this.setAction("close") //.setInnerHTML("&#10799;")
        */

        return this
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


})
