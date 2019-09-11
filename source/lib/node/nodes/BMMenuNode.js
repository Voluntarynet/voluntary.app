"use strict"

/*
    
    BMMenuNode
    
    A node that supports for adding, reordering, etc other nodes to it within the UI.
    
*/


BMStorableNode.newSubclassNamed("BMMenuNode").newSlots({
    label: "",
    hasTest: false,
    hasSubtitleOfValues: false,
}).setSlots({
    init: function () {
        BMStorableNode.init.apply(this)
        this.setShouldStore(true)
        this.setShouldStoreSubnodes(true)
        this.setCanDelete(true)
        this.setNodeCanInspect(true)
        this.addAction("add")
        this.setNodeMinWidth(300)

        this.setTitle("title")
        this.setNodeTitleIsEditable(true)

        //this.setSubtitle("subtitle")
        //this.setNodeSubtitleIsEditable(true)

        //this.setSubnodeProto(BMMenuNode)
        this.setSubnodeProto(BMCreatorNode)
        
        this.setNodeCanReorderSubnodes(true)
        this.addStoredSlot("label")

        //this.setNodeColumnStyles(BMViewStyles.clone())
        //this.setNodeRowStyles(BMViewStyles.clone())

        //this.setNodeUsesColumnBackgroundColor(false)

        //this.addInspectorField(BMBooleanField.clone().setKey("test").setValueMethod("hasTest").setValueIsEditable(true).setTarget(this))
    },

    didLoadFromStore: function() {
        BMStorableNode.didLoadFromStore.apply(this)
        this.subnodes().forEach( (subnode) => { subnode.setCanDelete(true) });
        this.subnodes().forEach( (subnode) => { subnode.setNodeCanInspect(true) });
        return this
    },

    title: function () {
        return this.label()
    },

    setTitle: function (aString) {
        this.setLabel(aString)
        this.tellParentNodes("onDidEditNode", this)
        return this
    },

    subtitle: function() {
        if (this.hasSubtitleOfValues()) {
            let parts = []
            this.subnodes().forEach((subnode) => {
                if (subnode.value) {
                    parts.push(subnode.value())
                }
            })
            return parts.join(" ")
        }
        return BMStorableNode.subtitle.apply(this)
    },

    /*
    colorPairForDepth: function (depthNumber) {
        if (depthNumber % 2 === 1) {
            return [CSSColor.redColor(), CSSColor.yellowColor()]
        }

        return [CSSColor.blueColor(), CSSColor.blueColor().copy().lighten(0.75)]
    },

    nodeBackgroundColorObject: function () {
        if (!this.parentNode()) {
            return CSSColor.whiteColor()
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
        styles.unselected().setColor(CSSColor.whiteColor().cssColorString())
        //styles.unselected().setBorderTop("1px solid " + c.cssColorString())
        //styles.unselected().setBorderBottom("1px solid " + c.cssColorString())

        //styles.selected().setBackgroundColor(CSSColor.grayColor().cssColorString())
        styles.selected().setColor(CSSColor.whiteColor().cssColorString())

        styles.selected().setBackgroundColor(c.copy().darken(0.8).cssColorString())
        //styles.selected().setBackgroundColor(c.copy().lighten(0.2).cssColorString())
        //styles.selected().setBackgroundColor(c.copy().cssColorString())
        //styles.selected().setColor(CSSColor.whiteColor().cssColorString())
        //styles.selected().setBorderTop("1px solid white")
        //styles.selected().setBorderBottom("1px solid white")

        //this._nodeRowStyles.active().setBackgroundColor(c.copy().lighten(0.75).cssColorString())
        return this._nodeRowStyles
    },
    */
    
    note: function() {
        return "&gt"
    },

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

