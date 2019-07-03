"use strict"

/*
    
    BMFlexNode
    
    A node that supports adding, reordering, etc other nodes to it within the UI.
    
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
        this.setCanDelete(true)
        this.addAction("add")
        //this.setNodeColumnBackgroundColor("white")
        this.setNodeMinWidth(300)

        this.setTitle("title")
        this.setNodeTitleIsEditable(true)

        //this.setSubtitle("subtitle")
        //this.setNodeSubtitleIsEditable(true)

        //this.setSubnodeProto(BMFlexNode)
        this.setSubnodeProto(BMCreatorNode)
        
        this.setNodeCanReorderSubnodes(true)
        this.addStoredSlot("label")

        //this.setNodeColumnStyles(BMViewStyles.clone())
        //this.setNodeRowStyles(BMViewStyles.clone())

        //this.setNodeUsesColumnBackgroundColor(false)
    },

    title: function () {
        return this.label()
    },

    setTitle: function (aString) {
        this.setLabel(aString)
        this.tellParentNodes("onDidEditNode", this)
        return this
    },

    
    colorPairForDepth: function (depthNumber) {
        if (depthNumber % 2 === 1) {
            return [BMColor.redColor(), BMColor.yellowColor()]
        }

        return [BMColor.blueColor(), BMColor.blueColor().copy().lighten(0.75)]
    },


    nodeBackgroundColorObject: function () {
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

    
    nodeRowStyles: function () {
        // const nextColor = this.colorPairForDepth(this.nodeDepth()+1)[0]
        if (!this._nodeRowStyles) {
            this.customizeNodeRowStyles()
        }

        const styles = this._nodeRowStyles
        const c = this.nodeBackgroundColorObject()

        styles.unselected().setBackgroundColor(c.cssColorString())
        //styles.unselected().setBackgroundColor(c.copy().darken(0.5).cssColorString())
        //styles.unselected().setColor(c.copy().lighten(0.55).cssColorString())
        styles.unselected().setColor(BMColor.whiteColor().cssColorString())
        //styles.unselected().setBorderTop("1px solid " + c.cssColorString())
        //styles.unselected().setBorderBottom("1px solid " + c.cssColorString())

        //styles.selected().setBackgroundColor(BMColor.grayColor().cssColorString())
        styles.selected().setColor(BMColor.whiteColor().cssColorString())

        styles.selected().setBackgroundColor(c.copy().darken(0.8).cssColorString())
        //styles.selected().setBackgroundColor(c.copy().lighten(0.2).cssColorString())
        //styles.selected().setBackgroundColor(c.copy().cssColorString())
        //styles.selected().setColor(BMColor.whiteColor().cssColorString())
        //styles.selected().setBorderTop("1px solid white")
        //styles.selected().setBorderBottom("1px solid white")

        //this._nodeRowStyles.active().setBackgroundColor(c.copy().lighten(0.75).cssColorString())
        return this._nodeRowStyles
    },
    /*
    note: function() {
        if (this.node().isSelected()) {
            return "&gt"
        }
        return ""
    },
    */
    

    /*
    didReorderParentSubnodes: function() {
        BMNode.didReorderParentSubnodes.apply(this)
        this.scheduleSyncToView()
        return this
    },

    didUpdateParentNode: function() {

    },
    */

    didChangeParentNode: function () {
        this.scheduleSyncToView()
    },

    isFlexRoot: function () {
        return this.parentNode() && (this.parentNode().type() !== this.type())
    },

    onDidEditNode: function (aNode) {
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

    /*
    didChangeParentNode: function () {
        BMStorableNode.didChangeParentNode.apply(this)
        if (this.isFlexRoot()) {
            this.removeAction("delete")
        }
    },
    */


})

