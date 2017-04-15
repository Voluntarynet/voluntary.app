
BrowserFieldRow = BrowserRow.extend().newSlots({
    type: "BrowserFieldRow",
    allowsCursorNavigation: false,
}).setSlots({
    init: function () {
        BrowserRow.init.apply(this)
        this.setIsSelectable(false) 
        this.title().turnOnUserSelect()
        this.subtitle().turnOffUserSelect()
        this.makeCursorDefault()
		this.setSpellCheck(false)
        return this
    },
    
    setNode: function(aNode) {
        BrowserRow.setNode.apply(this, [aNode])
        
        if (aNode) {
            var name = aNode.nodeOverrideDivClassName() 
            if (name == null) { name = "BrowserFieldRow" }
            this.setDivClassName(name)
            if(aNode.nodeAfterContent()) {
                this.title().setContentAfterString(aNode.nodeAfterContent())
            }
        }     
        
        return this
    },
    
    unselectionBgColor: function() {
        return "white"
    },
    
    selectionBgColor: function() {
        return "#eee"
    },
    
    updateSubviews: function() {
        var isEditable = this.node() ? this.node().nodeTitleIsEditable() : false;
        /*
        if (!isEditable) {
            this.title().element().style.color = "black"
        }
        */
        
        this.setEditable(isEditable)
        
        var node = this.node()

        if (node && node.nodeMinHeight()) {
            var e = this.element()
            if (node.nodeMinHeight() == -1) {
                
                e.style.height = "auto"
                e.style.paddingBottom = "calc(100% - 20px)";

            } else {
                e.style.height = node.nodeMinHeight() + "px"
            }
        }
        
        return this
    },
 
})
