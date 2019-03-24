"use strict"

/* 

    CloseableNodeView

*/

window.CloseableNodeView = NodeView.extend().newSlots({
    type: "CloseableNodeView",
    closeButton: null,
}).setSlots({
    init: function () {
        NodeView.init.apply(this)
        this.turnOffUserSelect()
        this.setCloseButton(CloseButton.clone().setTarget(this))
        this.addSubview(this.closeButton())
        return this
    },

    // --- closable set/get ---
    
    setIsCloseable: function(aBool) {
        this.closeButton().setIsEnabled(aBool)
        return this
    },

    
    isCloseable: function (aBool) {
        return this.closeButton().isEnabled()
    },
    
    // --- close with collapse animation ---

    collapse: function() {
        this.closeButton().setOpacity(0).setTarget(null)
        this.setOpacity(0)
		
        this.setWidth("0px")
		
        this.setPaddingLeft(0)
        this.setPaddingRight(0)
		
        this.setMarginLeft(0)
        this.setMarginRight(0)
    },
    
    close: function() {
        let seconds = 0.3
		
        this.collapse()
        
        setTimeout( () => { 
            //this.removeCloseButton()
            let parentView = this.parentView()
            //this.removeFromParentView()
            
            this.node().removeFromParentNode()

            //parentView.scheduleSyncToNode() 
            // TODO: protocol to tell parent to remove subnode

        }, seconds * 1000)
    },

})
