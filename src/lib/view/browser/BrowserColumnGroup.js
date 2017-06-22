
BrowserColumnGroup = NodeView.extend().newSlots({
    type: "BrowserColumnGroup",
    header: null,
    column: null,
    columnWrapper: null,
    emptyLabel: null,
}).setSlots({
    init: function () {
        NodeView.init.apply(this)
        this.setDivClassName("BrowserColumnGroup")
        
        this.setHeader(BrowserHeader.clone())
        this.addItem(this.header())
        
        this.setColumnWrapper(this)
        
        //this.setColumnWrapper(Div.clone().setDivClassName("BrowserColumnWrapper"))
        //this.addItem(this.columnWrapper())
        
        this.setColumn(BrowserColumn.clone())
        this.columnWrapper().addItem(this.column())
        
        return this
    },
    
    /// empty label 
    
    updateEmptyLabel: function() {
        var node = this.node()
        if (node) {
            if (node.items().length == 0 && node.nodeEmptyLabel()) {
                this.setEmptyLabelText(node.nodeEmptyLabel())
                return this
            }
        }
            
        this.removeEmptyLabel()
        return this
    },
    
    addEmptyLabelIfMissing: function() {
        if (!this.emptyLabel()) {
            this.setEmptyLabel(Div.clone().setDivClassName("BrowserColumnEmptyLabel"))
            this.setEmptyLabelText("").turnOffUserSelect()
            this.addItem(this.emptyLabel())            
        }
        
        return this
    },
    
    setEmptyLabelText: function(aString) {       
        this.addEmptyLabelIfMissing()     
        this.emptyLabel().setInnerHTML(aString)
        return this
    },
    
    removeEmptyLabel: function() {
        if (this.emptyLabel()) {
            this.removeItem(this.emptyLabel())
            this.setEmptyLabel(null)
        }
        return this
    },
    
    setColumnClass: function(columnClass) {
        if (this.column().type() != columnClass.type()) {
            
            var view = columnClass.clone().setNode(this.node())
            this.columnWrapper().removeItem(this.column())
            this.setColumn(view)
            this.columnWrapper().addItem(this.column())
            this.browser().clipToColumnGroup(this)
            //this.browser().fitToColumnWidths()
        }
        return this
    },
    
    setNode: function(aNode) {
        if (aNode == this._node) {
            //return
        }
         
        NodeView.setNode.apply(this, [aNode])

        this.setColumnClass(BrowserColumn)
        
        if (aNode) {
            
            // obey node's width preferences
            
            var w = this.node().nodeMinWidth()
            if (w) {
                //console.log("setNode setMinAndMaxWidth")
                this.setMinAndMaxWidth(w)
            }

            // use custom class for column if node wants it
            
            var customViewClass = aNode.viewClass()
		//	console.log(this.node().title() + " customViewClass = ", customViewClass)
		//	console.log(this.node().title() + " viewClassName = ", this.node().viewClassName())
                    
            if (customViewClass) {
                this.setColumnClass(customViewClass)
                //this.browser().fitToColumnWidths()
            }
            
        } else {
            this.setColumnClass(BrowserColumn)
        }
        
        this.header().setNode(aNode)
        this.column().setNode(aNode)
        return this
    },

    browser: function() {
        return this.parentItem()
    },
    

    /*
    NOT USED - VIEWS DON'T IMPLEMENT didUpdate now - they use didUpdateNode
    the syncFromNode overide in this class handles the subviews
    
    didUpdate: function() {
        dfdffdfdf()
        this.log("didUpdate")
        this.header().didUpdate()
        this.column().didUpdate()
        return this        
    },
    */

    // just using this to make debugging easier

    syncFromNode: function () {        
        //console.log("BrowserColumnGroup syncFromNode "  + this.node().type())
        this.header().syncFromNode()
        this.column().syncFromNode()
        this.updateEmptyLabel()
        return this
    },
})
