"use strict"

/*

    BrowserFooter

*/

window.BrowserFooter = NodeView.extend().newSlots({
    type: "BrowserFooter",

    leftActionsView: null,
    textView: null,
    rightActionsView: null,
}).setSlots({
    init: function () {
        NodeView.init.apply(this)
        //this.setOwnsView(false)

        this.setLeftActionsView(DomView.clone().setDivClassName("BrowserFooterLeftActionsView NodeView DomView"))
		
        const textView = TextField.clone().setDivClassName("BrowserFooterTextView NodeView DomView") //.setUserSelect("none")
        this.setTextView(textView)
	    this.textView().setContentEditable(true).setDoesClearOnReturn(true).setDoesHoldFocusOnReturn(true)
						
        this.setRightActionsView(DomView.clone().setDivClassName("BrowserFooterRightActionsView NodeView DomView"))
		
		
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
        if (aNode === this._node) {
            //return
        }
        
        NodeView.setNode.apply(this, [aNode])
        this.updateTextView()
    },

    didInput: function(aView) {
        this.setInput(aView.innerHTML())
        return this
    },
    
    setInput: function(s) {
        //console.trace(this.typeId() + ".setInput('" + s + "')")
        
        const n = this.node()
        if (n) {
            const m = n.nodeInputFieldMethod()
            if (m) {
                n[m].apply(n, [s])
            }
        }
        
        // TODO: hack - need a better way to ensure this happens after node does syncToView
        // maybe, scrollToBottomOnAdd?
        /*
        setTimeout(() => {
            this.columnGroup().scrollView().scrollToBottom()
        }, 10) 
        */
        
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
        return this.node() && (this.node().nodeInputFieldMethod() !== null)
    },
    
    syncFromNode: function() {
        const node = this.node()
        this.removeAllSubviews()
        
        if (node) {
            this.updateTextView()
        } 
        return this
    },
    
})


