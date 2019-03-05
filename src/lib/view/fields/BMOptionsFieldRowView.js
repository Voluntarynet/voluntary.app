"use strict"

/*

    BMOptionsFieldRowView

*/


window.BMOptionsFieldRowView = BMFieldRowView.extend().newSlots({
    type: "BMOptionsFieldRowView",
    optionsView: null,
}).setSlots({
    init: function () {
        BMFieldRowView.init.apply(this)

        this.setOptionsView(BMOptionsTableView.clone())
        this.optionsView().setDisplay("none")
        this.addSubview(this.optionsView())

        this.valueView().setIsRegisteredForFocus(true)
        this.valueView().onBlur = () => { this.close() }
        return this
    },
	
    // ------------------ open / close ------------------

    toggleOpen: function() {
        if (!this.isOpen()) { 
            this.open() 
        } else {
            this.close()
        }
        return this
    },
	
    isOpen: function() {
        return this.optionsView().display() != "none"
    },
	
	
    open: function() {
        if(!this.isOpen()) {
            //console.log(this.type() + " open")
            this.updateValidValues()
            this.optionsView().fadeInToDisplayInlineBlock()
            this.noteView().fadeOutToDisplayNone()
        } else {
            this.updateValidValues()
        }
    },                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        
	
    close: function() {
        if(this.isOpen()) {
            //console.log(this.type() + " close")
            this.optionsView().fadeOutToDisplayNone()
            this.noteView().fadeInToDisplayInlineBlock() 
        }
    },
	
    select: function(validValue) {
        //console.log(this.type() + " selected " + validValue)
        //this.setInnerHTML(validValue)
        this.node().setValue(validValue)
        this.node().didUpdateView(this)
        this.close()
    },
	
    /*
	showActive: function() {
		//this.setBackgroundColor(this.activeBackgroundColor())
		//this.setColor(this.activeColor())
		return this
	},
	
	showInactive: function() {
		//this.setBackgroundColor(this.inactiveBackgroundColor())
		//this.setColor(this.inactiveColor())
		return this
	},
	*/
	
    // --------------------------------------

    setNode: function(aNode) {
        NodeView.setNode.apply(this, [aNode])
        this.updateValidValues()
        return this
    },
	
    currentValue: function() {
        return this.valueView().innerHTML()
    },
	
    currentValidValues: function() {
        let  validValues = this.node().validValues()
        let  value = this.currentValue().strip()
		
        if (value.length) {
            validValues = validValues.select(function (v) { return v.beginsWith(value) || v.contains(value) })
        }
		
        return validValues
    },
	
    updateValidValues: function() {
        if (this.optionsView()) {
            this.optionsView().setValidValues(this.currentValidValues())
            //this.optionsView().setLeft(this.left() + this.clientWidth() + 10)
        }
        return this
    },
	
    onDidEdit: function() {
        let  returnValue = BMFieldRowView.onDidEdit.apply(this)
        //	console.log(this.type() + " onDidEdit")
		
        let  currentValidValues = this.currentValidValues()
		
        if (currentValidValues.length == 1 && currentValidValues[0] == this.currentValue()) {
            this.close()
            return
        }

        if (this.currentValidValues().length > 0) {
            this.open()
        } else {
            this.close()
        }

    },
	
	
})

/*
BMOptionsTableRowView = NodeView.extend().newSlots({
    type: "BMOptionsTableRowView",
}).setSlots({
})
*/