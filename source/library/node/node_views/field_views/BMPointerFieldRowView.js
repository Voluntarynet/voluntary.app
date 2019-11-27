"use strict"

/*

    BMPointerFieldRowView

*/

window.BMPointerFieldRowView = class BMPointerFieldRowView extends BrowserTitledRow {
    
    initPrototype () {
        this.newSlots({
        })
    }

    init () {
        super.init()

        this.makeNoteRightArrow()
		
        this.styles().unselected().setColor("#888")
        this.styles().unselected().setBackgroundColor("white")

        this.styles().selected().setColor("#888")
        this.styles().selected().setBackgroundColor("#eee")
		
        return this
    }

    updateSubviews  () {	
        BrowserTitledRow.updateSubviews.apply(this)
		
        let node = this.node()

        if (this.isSelected()) {
            this.noteView().setOpacity(1)	
        } else {
            this.noteView().setOpacity(0.4)	
        }

        this.applyStyles()
		
        return this
    }
    
}.initThisClass()
