
GenericView = NodeView.extend().newSlots({
    type: "GenericView",
    titleView: null,
    subtitleView: null,
    middleView: null,
}).setSlots({
    init: function () {
        NodeView.init.apply(this)
        
        this.setDivClassName("GenericView")

        this.setMiddleView(NodeView.clone().setDivClassName("GenericMiddleView"))
        this.addItem(this.middleView()) 
        
        this.setTitleView(NodeView.clone().setDivClassName("GenericTitleView"))
        this.middleView().addItem(this.titleView())        

        this.middleView().addItem(Div.clone())        

        this.setSubtitleView(NodeView.clone().setDivClassName("GenericSubtitleView"))
        this.middleView().addItem(this.subtitleView())  

		this.titleView().setSpellCheck(false)
		this.subtitleView().setSpellCheck(false)

        
        this.setEditable(false)
        return this
    },

    syncFromNode: function () {
        var node = this.node()

        this.titleView().setInnerHTML(node.title())
        this.subtitleView().setInnerHTML(node.subtitle())
        
        this.titleView().setContentEditable(node.nodeTitleIsEditable())
        this.subtitleView().setContentEditable(node.nodeSubtitleIsEditable())

        return this
    },
    
    syncToNode: function () {
        var node = this.node()
        //this.log("syncToNode " + this.titleView().innerHTML())
        node.setTitle(this.titleView().innerHTML())
        node.setSubtitle(this.subtitleView().innerHTML())
        //node.didUpdate()
        //node.markDirty()
        NodeView.syncToNode.apply(this)
        return this
    },
    
    setEditable: function (aBool) {
        this.titleView().setContentEditable(aBool)
        this.subtitleView().setContentEditable(aBool)
        return this
    },
    
    onDidEdit: function (changedView) {     
        this.log("onDidEdit")   
        this.syncToNode()
    },
})
