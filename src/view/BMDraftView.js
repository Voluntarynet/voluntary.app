
/*
BMDraftView______ = NodeView.extend().newSlots({
    type: "BMDraftView",
    fromAddressView: null,
    toAddressView: null,
    statusView: null,
    subjectView: null,
    bodyView: null,    
}).setSlots({
    init: function () {
        NodeView.init.apply(this)
        
        this.setDivClassName("BMPostView")
        
        this.setToAddressView(NodeView.clone().setDivClassName("BMDraftToAddressView"))
        this.addItem(this.toAddressView())    
        
        this.setFromAddressView(NodeView.clone().setDivClassName("BMDraftFromAddressView"))
        this.addItem(this.fromAddressView())           
        
        this.setSubjectView(NodeView.clone().setDivClassName("BMPostSubjectView"))
        this.addItem(this.subjectView())
        
        this.setBodyView(NodeView.clone().setDivClassName("BMDraftBodyView").loremIpsum())
        this.addItem(this.bodyView())
        
        this.setEditable(true)
        return this
    },

    syncFromNode: function () {
        console.log(this.type() + " syncFromNode " + this.node().type())
        var node = this.node()
        this.subjectView().setInnerHTML(node.title())
        this.bodyView().setInnerHTML(node.body())
        return this
    },
    
    syncToNode: function () {
        console.log(this.type() + " syncToNode " + this.node().type())
        var node = this.node()
        node.setTitle(this.subjectView().innerHTML())
        node.setBody(this.bodyView().innerHTML())
        NodeView.syncToNode.apply(this)
        return this
    },
    
    setEditable: function (aBool) {
        this.subjectView().setContentEditable(aBool)
        this.bodyView().setContentEditable(aBool)
        return this
    },
    
    send: function () {
        this.node().send()
        return this
    },
    
    onDidEdit: function (changedView) {        
        this.syncToNode()
    },
})
*/