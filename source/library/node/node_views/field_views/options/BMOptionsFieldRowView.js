"use strict"

/*

    BMOptionsFieldRowView 

    View for BMOptionsField

    BMOptionsField -> BMOptionsFieldRowView
        BMOption -> BMSingleOptionRowView
        BMMultiOption -> BMMultiOptionRowView

*/


BrowserTitledRow.newSubclassNamed("BMOptionsFieldRowView").newSlots({
}).setSlots({
    init: function () {
        BrowserTitledRow.init.apply(this)
        //this.setHasSubtitle(true)


        return this
    },

    title: function() {
        return this.node().title()
    },

    subtitle: function() {
        return "selected options"
    },
                                 
    /*
    select: function(validValue) {
        //console.log(this.typeId() + " selected " + validValue)
        //this.setInnerHTML(validValue)
        
        this.node().setValue(validValue)
        this.node().didUpdateView(this)
    },
    */

    // --------------------------------------

    /*
    setNode: function(aNode) {
        NodeView.setNode.apply(this, [aNode])
        this.updateValidValues()
        return this
    },
    
	
    currentValue: function() {
        return this.valueView().innerHTML()
    },
	
    currentValidValues: function() {
        let validValues = this.node().validValues()
        let value = this.currentValue().strip()
		
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
        let returnValue = BrowserTitledRow.onDidEdit.apply(this)
        //	console.log(this.typeId() + " onDidEdit")
		
        let currentValidValues = this.currentValidValues()
		
        if (currentValidValues.length === 1 && currentValidValues[0] === this.currentValue()) {
            this.close()
            return
        }

        if (this.currentValidValues().length > 0) {
            this.open()
        } else {
            this.close()
        }

        return true
    },
    */
	
	
})
