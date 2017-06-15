
BrowserHeader = NodeView.extend().newSlots({
    type: "BrowserHeader",
}).setSlots({
    init: function () {
        NodeView.init.apply(this)
        this.setDivClassName("BrowserHeader")
        this.setOwnsView(false)
        return this
    },
    
    browser: function() {
        return this.parentItem().parentItem()
    },

    syncFromNode: function() {
        var node = this.node()
        this.removeAllItems()
        
        if (node) {
            node.actions().forEach( (action) => {
                var button = BrowserHeaderAction.clone()
                button.setAction(action).setTarget(node)
                this.addItem(button).syncFromNode()
            })
        }
        
        return this
    },
})
