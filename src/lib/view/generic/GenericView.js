"use strict"

/*

    GenericView

*/

window.GenericView = NodeView.extend().newSlots({
    type: "GenericView",
    titleView: null,
    subtitleView: null,
    middleView: null,
}).setSlots({
    init: function () {
        NodeView.init.apply(this)
        
        this.setMiddleView(NodeView.clone().setDivClassName("GenericMiddleView"))
        this.addSubview(this.middleView()) 
        
        this.setTitleView(NodeView.clone().setDivClassName("GenericTitleView"))
        this.middleView().addSubview(this.titleView())        

        this.middleView().addSubview(DivView.clone())        

        this.setSubtitleView(NodeView.clone().setDivClassName("GenericSubtitleView"))
        this.middleView().addSubview(this.subtitleView())  

        this.titleView().setSpellCheck(false)
        this.subtitleView().setSpellCheck(false)
        
        this.setEditable(false)
        return this
    },

    syncFromNode: function () {
        let  node = this.node()

        this.titleView().setInnerHTML(node.title())
        this.subtitleView().setInnerHTML(node.subtitle())
        
        this.titleView().setContentEditable(node.nodeTitleIsEditable())
        this.subtitleView().setContentEditable(node.nodeSubtitleIsEditable())

        return this
    },
    
    syncToNode: function () {
        let  node = this.node()
        //this.log("syncToNode " + this.titleView().innerHTML())
        node.setTitle(this.titleView().innerHTML())
        node.setSubtitle(this.subtitleView().innerHTML())
        NodeView.syncToNode.apply(this)
        return this
    },
    
    setEditable: function (aBool) {
        this.titleView().setContentEditable(aBool)
        this.subtitleView().setContentEditable(aBool)
        return this
    },
    
    onDidEdit: function (changedView) {     
        //this.log("onDidEdit")   
        this.scheduleSyncToNode() //this.syncToNode()
    },
})
