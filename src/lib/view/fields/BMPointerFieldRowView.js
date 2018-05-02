"use strict"

window.BMPointerFieldRowView = BrowserTitledRow.extend().newSlots({
    type: "BMPointerFieldRowView",
}).setSlots({
    init: function () {
        BrowserTitledRow.init.apply(this)
		this.makeNoteRightArrow()
		
		this.styles().unselected().setColor("#888")
		this.styles().unselected().setBackgroundColor("white")

		this.styles().selected().setColor("#888")
		this.styles().selected().setBackgroundColor("#eee")
		
        return this
    },

    updateSubviews: function () {	
		BrowserTitledRow.updateSubviews.apply(this)
		
        var node = this.node()

		if (this.isSelected()) {
			this.noteView().setOpacity(1)	
		} else {
			this.noteView().setOpacity(0.4)	
		}

        this.applyStyles()
		
        return this
    },
})
