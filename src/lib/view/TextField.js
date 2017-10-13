"use strict"

window.TextField = DivView.extend().newSlots({
    type: "TextField",
	isSelected: false,
	selectedColor: "white",
	unselectedColor: "rgba(255, 255, 255, 0.5)",
	doesClearOnReturn: false,
	doesHoldFocusOnReturn: false,
}).setSlots({
    init: function () {
        DivView.init.apply(this)
		this.setDisplay("inline-block")
        this.turnOffUserSelect()
		this.setWhiteSpace("nowrap")
		this.setOverflow("hidden")
		this.setDisplay("inline-block")
		this.setTextOverflow("ellipsis")
		this.setSpellCheck(false)
		
		//this.setUnfocusOnEnterKey(true)
		//this.setIsRegisteredForKeyboard(true) // gets set by setContentEditable()
		this.removeReturns()
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
	
	
	returnStrings: function() {
		return ["<div><br></div>", "<br><br>"]
	},
	
	containsReturns: function() {
        returnStrings.forEach((returnString) => {
            if (s.contains(returnString)) {
                return true
            }
        })		
		return false
	},
	
	setInnerHTML: function(s) {
		// need to blur it first, if user is typing 
		
		if (this.innerHTML() == s) {
			return this
		}
		
		if (s == null) { 
			s = ""
		}
		
		if (this.hasFocus()) {
        	this.blur()
		}
		//console.log("setInnerHTML '" + s + "'")
        DivView.setInnerHTML.apply(this, [s])

		//console.log("innerHTML =  '" + this.innerHTML() + "'")
		return this
	},
	
	
	removeReturns: function() {
        var didReturn = false
        var s = this.innerHTML()

		//console.log(this.typeId() + ".removeReturns() s = '" + s + "'")
		//console.log(this.typeId() + ".innerText() = '" + this.innerText() + "'")

        this.returnStrings().forEach((returnString) => {
            if (s.contains(returnString)) {
				//console.log(this.typeId() + ".removeReturns() found return in '" + s + "'")
                //s = s.replaceAll(returnString, "")
                didReturn = true
            }
        })

        if (didReturn) { 
            this.setInnerHTML(this.innerText())
        }

		return didReturn
	},

    didEdit: function() {
        DivView.didEdit.apply(this)
                
        if (this.removeReturns()) { 
            this.tellParentViews("didInput", this) 

            if (this.doesClearOnReturn()) {
                DivView.setInnerHTML.apply(this, [""])
            }
        
            if (this.doesHoldFocusOnReturn()) {
                this.focus()
            }	
        }
                
        return this
    },
    
    /*
    setInput: function(s) {
        var n = this.node()
        if (n) {
            var m = n.nodeInputFieldMethod()
            if (m) {
                n[m].apply(n, [s])
            }
        }
        return this
    },
    
    */

})
