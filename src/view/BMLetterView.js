
/*
BMLetterView = NodeView.extend().newSlots({
    type: "BMLetterView",
    fromAddressView: null,
    toAddressView: null,
    subjectView: null,
    bodyView: null,    
}).setSlots({
    init: function () {
        NodeView.init.apply(this)
        
        this.setDivClassName("BMLetterView")
        
        this.setToAddressView(NodeView.clone().setDivClassName("BMLetterToAddressView"))
        this.addSubview(this.toAddressView())    
        
        this.setFromAddressView(NodeView.clone().setDivClassName("BMLetterFromAddressView"))
        this.addSubview(this.fromAddressView())           
        
        this.setSubjectView(NodeView.clone().setDivClassName("BMPostSubjectView"))
        this.addSubview(this.subjectView())
        
        this.setBodyView(NodeView.clone().setDivClassName("BMLetterBodyView").loremIpsum())
        this.addSubview(this.bodyView())
        
        this.setEditable(true)
        return this
    },

    syncFromNode: function () {
        var node = this.node()
        this.subjectView().setInnerHTML(node.title())
        this.bodyView().setInnerHTML(node.body())
        return this
    },
    
    syncToNode: function () {
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