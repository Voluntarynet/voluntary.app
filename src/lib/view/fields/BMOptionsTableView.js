"use strict"

window.BMOptionsTableView = DivView.extend().newSlots({
    type: "BMOptionsTableView",
    validValues: null,
}).setSlots({
    init: function () {
        DivView.init.apply(this)
        this.turnOffUserSelect()
        return this
    },

    onClick: function() {

    },
	
    hasValidValues: function(validValues) {
        if (this._validValues) {
            if (this._validValues.equals(validValues)) {
                return true
            }
        }
        return false
    },
	
    setValidValues: function(validValues) {
        if (!this.hasValidValues(validValues)) {
            this._validValues = validValues
            this.updatedValidValues()
        }
        return this
    },
		
    updatedValidValues: function() {
        this.removeAllSubviews()
		
        this.setTransition("opacity .2s")
        this.setOpacity(0)
		
        this._validValues.forEach((v) => {
            var optionRow = DivView.clone().setDivClassName("BMOptionsTableRowView")//.setTarget(this).setAction("select")
            var optionColumn = DivView.clone().setDivClassName("BMOptionsTableColumnView").setInnerHTML(v).setTarget(this).setAction("select")
            optionRow.addSubview(optionColumn)
            optionColumn.validValue = v
            this.addSubview(optionRow)
        })
		
	    SyncScheduler.scheduleTargetAndMethod(this, "finishUpdatedValidValues")
        return this
    },
	
    finishUpdatedValidValues: function() {
        this.adjustOptionWidths() 
        this.setOpacity(1)
        return this
    },
	
    setOptionWidths: function(maxWidth) {
        this.subviews().forEach(function(subview) {
            subview.setMinAndMaxWidth(maxWidth)
        })
        return this
    },
	
    maxOptionTextWidth: function() {
        return this.subviews().maxValue(function(subview) {
            return DivTextTapeMeasure.widthOfDivClassWithText("BMOptionsTableRowView", subview.innerHTML())
        })			
    },
	
    adjustOptionWidths: function() {
        var maxWidth = this.maxOptionTextWidth()
		
        var leftPad = 10
        var rightPad = 10
		
        this.setOptionWidths(maxWidth)
		
        var subviewsPerRow = 1
		
        if (this.subviews().length > 10) {
            subviewsPerRow = Math.ceil(Math.sqrt(this.subviews().length))
        }
		
        var fullWidth = maxWidth * subviewsPerRow 
        var w = fullWidth + leftPad + rightPad
		
        //this.setMinAndMaxWidth(w)
		
        this.subviews().forEach((subview) => {
            //subview.setTextAlign("left")
            //subview.setPaddingLeft(leftPad)
            //subview.setPaddingRight(rightPad)
            subview.setMinAndMaxWidth(w)
        })
		
        //var rowCount = this.subviews().length / subviewsPerRow
        //var h = rowCount * 26
        //console.log("maxHeight = ", h)
        //this.setMinAndMaxHeight(h)
		
        /*
		console.log(this.type() + " maxWidth: ", maxWidth)
		console.log(this.type() + " subviewsPerRow: ", subviewsPerRow)
		console.log(this.type() + " fullWidth: ", fullWidth)
		console.log(this.type() + " setMinAndMaxWidth: ", w)
		*/
		
        /*
		if (subviewsPerRow == 1) {
			this.subviews().forEach(function(subview) {
				subview.setTextAlign("left")
				subview.setPaddingLeft(leftPad)
				subview.setPaddingRight(rightPad)
			})
			//this.parentView().setMinAndMaxWidth(fullWidth)
			//this.setLeft(fullWidth + 30)
		} else {
			this.subviews().forEach(function(subview) {
				subview.setTextAlign("left")
				subview.setPaddingLeft(leftPad)
				subview.setPaddingRight(rightPad)
			})			
			//this.parentView().textView().setMinAndMaxWidth(maxWidth)
			//this.setLeft(maxWidth + 30)
		}
		*/
		
        //this.setLeft(0)
    },
	
    select: function(sender) {
        //console.log("selected " + sender.validValue)
        this.parentView().select(sender.validValue)
    },
})
