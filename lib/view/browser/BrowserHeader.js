
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
            var self = this
            node.actions().forEach(function (action) {
                var button = BrowserHeaderAction.clone()
                button.setAction(action).setTarget(node)
                self.addItem(button).syncFromNode()
            })
        }
        
        return this
    },
})
