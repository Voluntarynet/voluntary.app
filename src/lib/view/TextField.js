TextField = DivView.extend().newSlots({
    type: "TextField",
	isSelected: false,
	selectedColor: "white",
	unselectedColor: "rgba(255, 255, 255, 0.5)",
}).setSlots({
    init: function () {
        DivView.init.apply(this)
		this.setDisplay("inline-block")
        //this.setInnerHTML("")
        this.turnOffUserSelect()
		//this.setUnfocusOnEnterKey(true)
		//this.setIsRegisteredForKeyboard(true)
        return this
    },

	setIsSelected: function(aBool) {
	    this._isSelected = aBool
	    this.updateColors()
	    return this
	},
	
	updateColors: function() {
	    if (this.isSelected()) {
	        this.setColor(this.selectedColor())
	    } else {
	        this.setColor(this.unselectedColor())
	    }
	    return this
	},

/*
	// --- support for begin editing when return is hit ------

    beginEditingOnReturnKey: function() {
		this.setIsRegisteredForKeyboard(true)
		
		return this
    },

	// --- remove return characters when editing title -------

	cleanText: function() {
		console.log(this.type() + " cleanText")
		var s = this.innerHTML()
		s = s.replaceAll("<br>", "")
		s = s.replaceAll("<div></div>", "")
		s = s.replaceAll("<div>", "")
		s = s.replaceAll("</div>", "")
		
		this.setInnerHTML(s)
		return this
	},

	onKeyUp: function(event) {
		//console.log(this.type() + " onKeyUp ", event.keyCode)
		
		if (event.keyCode == 13) { // enter key
			//this.setContentEditable(false)
						
			setTimeout(() => {
				this.blur()
				this.cleanText()
				var p = this.element().parentNode.parentNode
				console.log("blurred self and focusing ", p.className)
				p.focus()
			}, 10)
			
			return true
		}
		
        event.preventDefault()
		event.stopPropagation()
        this.tellParentViews("onDidEdit", this)
		return false
		//return DivView.onKeyUp.apply(this, [event])
	},
*/

})
