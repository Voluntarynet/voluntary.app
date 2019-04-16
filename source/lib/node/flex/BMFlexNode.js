"use strict"

/*
    
    BMFlexNode
    
	
*/

window.BMFlexNode = BMStorableNode.extend().newSlots({
    type: "BMFlexNode",
    label: "",
}).setSlots({
    init: function () {
        BMStorableNode.init.apply(this)
        this.setShouldStore(true)
        this.setShouldStoreSubnodes(true)
        //this.setViewClassName("GenericView")
        //this.setViewClassName("BMDataStoreRecordView")
        this.addAction("add")
        this.addAction("delete")
        //this.setNodeColumnBackgroundColor("white")
        this.setNodeMinWidth(300)

        this.setTitle("title")
        this.setNodeTitleIsEditable(true)

        //this.setSubtitle("subtitle")
        //this.setNodeSubtitleIsEditable(true)

        this.setSubnodeProto(BMFlexNode)
        this.setNodeCanReorder(true)
        this.addStoredSlot("label")

        this.setNodeColumnStyles(BMViewStyles.clone())
        this.setNodeRowStyles(BMViewStyles.clone())
    },

    title: function() {
        return this.label()
    },

    setTitle: function(aString) {
        this.setLabel(aString)
        this.tellParentNodes("onDidEditNode", this)
        return this
    },

    colorPairForDepth: function(depthNumber) {
        if (depthNumber % 2 === 1) {
            return [BMColor.redColor(), BMColor.yellowColor()]
        } 
        
        return [BMColor.blueColor(), BMColor.blueColor().copy().lighten(0.75)]
    },

    nodeBackgroundColorObject: function() {
        if (!this.parentNode()) {
            return BMColor.whiteColor()
        }

        const colorPair = this.colorPairForDepth(this.nodeDepth())
        const index = this.subnodeIndex()
        const ratio = index / this.parentNode().subnodes().length
        const topColor = colorPair[0]
        const bottomColor = colorPair[1]
        const c = topColor.interpolateWithColorTo(bottomColor, 1 - ratio)
        //console.log("index:" + index + " ratio:" + ratio + " c:", c.cssColorString())
        return c
    },

    nodeRowStyles: function() {
        const styles = this._nodeRowStyles
        const c = this.nodeBackgroundColorObject()

        styles.unselected().setBackgroundColor(c.cssColorString())
        styles.unselected().setColor(c.copy().lighten(0.55).cssColorString())
        //styles.unselected().setColor(BMColor.whiteColor().darken(0.75).cssColorString())
        //styles.unselected().setBorderTop("1px solid " + c.cssColorString())
        //styles.unselected().setBorderBottom("1px solid " + c.cssColorString())

        //styles.selected().setBackgroundColor(c.copy().darken(0.75).cssColorString())
        styles.selected().setBackgroundColor(c.copy().cssColorString())
        styles.selected().setColor(BMColor.whiteColor().cssColorString())
        //styles.selected().setBorderTop("1px solid white")
        //styles.selected().setBorderBottom("1px solid white")

        //this._nodeRowStyles.active().setBackgroundColor(c.copy().lighten(0.75).cssColorString())
        return this._nodeRowStyles
    },

    /*
    didReorderParentSubnodes: function() {
        BMNode.didReorderParentSubnodes.apply(this)
        this.scheduleSyncToView()
        return this
    },

    didUpdateParentNode: function() {

    },
    */

    didChangeParentNode: function() {
        this.scheduleSyncToView()
    },

    isFlexRoot: function() {
        return this.parentNode().type() !== this.type()
    },

    onDidEditNode: function(aNode) {
        if (this.parentNode() && this.isFlexRoot() && !this.isLoadingFromJSON()) {
            //const json = this.asJSON()
            //console.log(this.asJSON())
            //this.fromJSON(json)
        }
    },

    /*
    asJSON: function() {
        const json = BMStorableNode.asJSON.apply(this)
        json._label = this.label()
        return json
    },

    fromJSON: function(json) {
        const obj = this.fromJSON.apply(this, [json])
        obj.setLabel(json._label)
        return obj
    },

    */

})

