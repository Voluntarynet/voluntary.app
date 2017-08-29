
BrowserFooter = NodeView.extend().newSlots({
    type: "BrowserFooter",

	leftActionsView: null,
	textView: null,
	rightActionsView: null,
}).setSlots({
    init: function () {
        NodeView.init.apply(this)
        this.setOwnsView(false)

		this.setLeftActionsView(DivView.clone().setDivClassName("BrowserFooterLeftActionsView NodeView DivView"))
		
		var textView = TextField.clone().setDivClassName("BrowserFooterTextView NodeView DivView") //.setUserSelect("none")
		this.setTextView(textView)
		
		this.setRightActionsView(DivView.clone().setDivClassName("BrowserFooterRightActionsView NodeView DivView"))
	    this.textView().setContentEditable(true)
						
		this.setZIndex(2)
        return this
    },
    
	columnGroup: function() {
		return this.parentView()
	},
	
    browser: function() {
        return this.columnGroup().parentView()
    },

    setNode: function(aNode) {
        if (aNode == this._node) {
            //return
        }
        
        NodeView.setNode.apply(this, [aNode])
        this.updateTextView()
    },

    didInput: function(aView) {
        this.setInput(aView.innerHTML())
        aView.setInnerHTML("")
        return this
    },
    
    setInput: function(s) {
        console.log(this.typeId() + ".setInput('" + s + "')")
        var n = this.node()
        if (n) {
            var m = n.nodeInputFieldMethod()
            if (m) {
                n[m].apply(n, [s])
            }
        }
        return this
    },
    
    updateTextView: function() {
        //console.log("this.shouldShowTextView() = ", this.shouldShowTextView())
        if (this.shouldShowTextView()) {
            if (!this.hasSubview(this.textView())) {
		        this.addSubview(this.textView())
	        }
        } else {
            if (this.hasSubview(this.textView())) {
		        this.removeSubview(this.textView())
	        }
        }
        return this
    },
    
    shouldShowTextView: function() {
        return this.node() && (this.node().nodeInputFieldMethod() != null)
    },
    
    syncFromNode: function() {
        var node = this.node()
        this.removeAllSubviews()
        
        if (node) {
            this.updateTextView()
        } 
        return this
    },
    
})


