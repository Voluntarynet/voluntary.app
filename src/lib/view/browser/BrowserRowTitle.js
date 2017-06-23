BrowserRowTitle = Div.extend().newSlots({
    type: "BrowserRowTitle",
	isSelected: false,
}).setSlots({
    init: function () {
        Div.init.apply(this)
        this.setDivClassName("BrowserRowTitle")
        this.setInnerHTML("title")
        this.turnOffUserSelect()
		//this.setUnfocusOnEnterKey(true)
		this.registerForKeyboard(true)
		this.setDisplay("inline-block")
        return this
    },

/*
	updateSubviews: function() {
		 if (this.isSelected()) {
			this.setColor("#CBCBCB")
		}
	},
	*/

    setHasSubtitle: function(aBool) {        
        if (aBool) {
            this.setTop(10)
        } else {
            this.setTop(22)      
        }

        return this
    },

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
        this.tellParents("onDidEdit", this)
		return false
		//return Div.onKeyUp.apply(this, [event])
	},
})
