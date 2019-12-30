"use strict"

/*
    
    BMMenuNode
    
    A node that supports for adding, reordering, etc other nodes to it within the UI.
    
*/

window.BMMenuNode = class BMMenuNode extends BMSummaryNode {
    
    initPrototype () {
        this.newSlot("label", "").setShouldStoreSlot(true)

        this.setCanDelete(true)
        this.setNodeCanInspect(true)
        this.setShouldStore(true)
        this.setShouldStoreSubnodes(true)
        this.setNodeMinWidth(300)

        this.setTitle("title")
        this.setNodeCanEditTitle(true)
        
        this.setNodeCanReorderSubnodes(true)

        //this.setNodeColumnStyles(BMViewStyles.clone())
        //this.setNodeRowStyles(BMViewStyles.clone())
        //this.setNodeUsesColumnBackgroundColor(false)

        this.setNodeCanInspect(true) 
    }

    init () {
        super.init()
        this.addAction("add")
        this.setSubnodeProto(BMCreatorNode)
    }

    /*
    initNodeInspector () {
        super.initNodeInspector()
        return this
    }
    */

    /*
    didLoadFromStore () {
        super.didLoadFromStore()
        return this
    }
    */

    title () {
        return this.label()
    }

    setTitle (aString) {
        this.setLabel(aString)
        //this.tellParentNodes("onDidEditNode", this)
        return this
    }

    acceptedSubnodeTypes () {
        return BMCreatorNode.fieldTypes()
    }

    /*
    colorPairForDepth (depthNumber) {
        if (depthNumber % 2 === 1) {
            return [CSSColor.redColor(), CSSColor.yellowColor()]
        }

        return [CSSColor.blueColor(), CSSColor.blueColor().copy().lighten(0.75)]
    }

    nodeBackgroundColorObject () {
        if (!this.parentNode()) {
            return CSSColor.whiteColor()
        }

        const colorPair = this.colorPairForDepth(this.nodeDepth())
        const index = this.subnodeIndexInParent()
        const ratio = index / this.parentNode().subnodeCount()
        const topColor = colorPair[0]
        const bottomColor = colorPair[1]
        const c = topColor.interpolateWithColorTo(bottomColor, 1 - ratio)
        //console.log("index:" + index + " ratio:" + ratio + " c:", c.cssColorString())
        return c
    }

    nodeRowStyles () {
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
    }
    */
    
    note () {
        return "&gt;"
    }

    didChangeParentNode () {
        this.scheduleSyncToView()
    }

    /*
    onDidEditNode (aNode) {
    }
    */

}.initThisClass()

