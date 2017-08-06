
BMPointerFieldRowView = BrowserTitledRow.extend().newSlots({
    type: "BMPointerFieldRowView",
}).setSlots({
    init: function () {
        BrowserTitledRow.init.apply(this)
        
/*
		//this.noteView().setInnerHTML("→")
        this.valueView().setTarget(this).setAction("clickedOnValue")
        //this.valueView().setTarget(this).setAction("clickedOnValue")

		//this.setValueIsVisible(true)
        this.valueView().turnOffUserSelect()
        //this.valueView().setDisplay("none")
		//this.keyView().setMinAndMaxWidth(500)
		this.keyView().setContentAfterString("").setTextAlign("left")
		*/
		//this.setIsSelectable(true)
		
		/*this.setBorderBottom("1px solid #ddd")*/

		this.noteView().setBackgroundImageUrlPath(this.pathForIconName("right"))        
		this.noteView().setBackgroundSize(10, 10)
		//this.noteView().setOpacity(0.25)
		this.noteView().setMinAndMaxWidth(10).setMinAndMaxHeight(10)

        return this
    },

	selectedTextColor: function() {
		return "black"
	},
	
	unselectedTextColor: function() {
		return "rgba(0, 0, 0, 0.6)"
	},
	
    selectedBgColor: function() {
        return "rgba(0, 0, 0, 0.1)"
    },

    syncFromNode: function () {
		//console.log(this.type() + " syncFromNode this.isSelected() = ", this.isSelected())
	
		BrowserTitledRow.syncFromNode.apply(this)
        var node = this.node()
        this.noteView().setString("")
        this.updateSubviews()

		if (this.isSelected()) {
			this.noteView().setOpacity(1)	
		} else {
			this.noteView().setOpacity(0.25)	
		}
        return this
    },
})
