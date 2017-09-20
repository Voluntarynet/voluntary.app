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
		
		//this.setUnfocusOnEnterKey(true)
		//this.setIsRegisteredForKeyboard(true) // gets set by setContentEditable()
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
		return ["<div><br></div>", "<br>"]
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

        this.returnStrings().forEach((returnString) => {
            if (s.contains(returnString)) {
                s = s.replaceAll(returnString, "")
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
    
    
/*

    // this should be moved to a BrowserRow behavior
    
    
    
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
