"use strict"

window.CloseableNodeView = NodeView.extend().newSlots({
    type: "AtomNodeView",
    closeButton: null,
}).setSlots({
    init: function () {
        NodeView.init.apply(this)
        this.turnOffUserSelect()
        this.setCloseButton(CloseButton.clone().setTarget(this))
        this.addSubview(this.closeButton())
        return this
    },

    // --- set/get ---
    
    setIsCloseable: function(aBool) {
        this.closeButton().setIsEnabled(aBool)
        return this
    },

    
    isCloseable: function (aBool) {
        return this.closeButton().isEnabled()
    },
    
    // --- close with collapse animation ---

    collapse: function() {
        this.closeButtonView().setOpacity(0).setTarget(null)
        this.setOpacity(0)
		
        this.setWidth("0px")
		
        this.setPaddingLeft(0)
        this.setPaddingRight(0)
		
        this.setMarginLeft(0)
        this.setMarginRight(0)
    },
    
    close: function() {
        var seconds = 0.3
		
        this.collapse()
        
        setTimeout( () => { 
            this.removeCloseButton()
            var parentView = this.parentView()
            this.removeFromParentView()
            parentView.scheduleSyncToNode() 

        }, seconds * 1000)
    },

})
