"use strict"

/*
    
    BMMenuNode
    
    A node that supports for adding, reordering, etc other nodes to it within the UI.
    
*/

window.BMMenuNode = class BMMenuNode extends BMSummaryNode {
    
    initPrototype () {
        this.newSlots({
            label: "",
            //hasSubtitleOfValues: false,
        })
    }

    init () {
        super.init()

        this.setShouldStore(true)
        this.setShouldStoreSubnodes(true)
        this.setCanDelete(true)
        this.setNodeCanInspect(true)
        this.addAction("add")
        this.setNodeMinWidth(300)

        this.setTitle("title")
        this.setNodeCanEditTitle(true)

        //this.setSubtitle("subtitle")
        //this.setNodeCanEditSubtitle(true)

        //this.setSubnodeProto(BMMenuNode)
        this.setSubnodeProto(BMCreatorNode)
        
        this.setNodeCanReorderSubnodes(true)
        this.addStoredSlot("label")

        //this.setNodeColumnStyles(BMViewStyles.clone())
        //this.setNodeRowStyles(BMViewStyles.clone())

        //this.setNodeUsesColumnBackgroundColor(false)

        this.setCanDelete(true)
        this.setNodeCanInspect(true) 
    }

    /*
    initNodeInspector () {
        super.initNodeInspector()
        return this
    }
    */

    didLoadFromStore () {
        super.didLoadFromStore()
        /*
        this.subnodes().forEach( (subnode) => { 
            subnode.setCanDelete(true)
            subnode.setNodeCanInspect(true) 
        });
        */
        return this
    }

    title  () {
        return this.label()
    }

    setTitle  (aString) {
        this.setLabel(aString)
        //this.tellParentNodes("onDidEditNode", this)
        return this
    }

    acceptedSubnodeTypes () {
        return BMCreatorNode.fieldTypes()
    }

    /*
    subtitle () {
        if (this.hasSubtitleOfValues()) {
            const parts = []
            this.subnodes().forEach((subnode) => {
                if (subnode.value) {
                    parts.push(subnode.value())
                }
            })
            return parts.join(" ")
        }
        return super.subtitle()
    }
    */

    /*
    colorPairForDepth  (depthNumber) {
        if (depthNumber % 2 === 1) {
            return [CSSColor.redColor(), CSSColor.yellowColor()]
        }

        return [CSSColor.blueColor(), CSSColor.blueColor().copy().lighten(0.75)]
    }

    nodeBackgroundColorObject  () {
        if (!this.parentNode()) {
            return CSSColor.whiteColor()
        }

        const colorPair = this.colorPairForDepth(this.nodeDepth())
        const index = this.subnodeIndex()
        const ratio = index / this.parentNode().subnodeCount()
        const topColor = colorPair[0]
        const bottomColor = colorPair[1]
        const c = topColor.interpolateWithColorTo(bottomColor, 1 - ratio)
        //console.log("index:" + index + " ratio:" + ratio + " c:", c.cssColorString())
        return c
    }

    nodeRowStyles  () {
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

    didChangeParentNode  () {
        this.scheduleSyncToView()
    }

    /*
    isFlexRoot  () {
        return this.parentNode() && (this.parentNode().type() !== this.type())
    }
    */

    onDidEditNode  (aNode) {
        /*
        if (this.parentNode() && this.isFlexRoot() && !this.isLoadingFromJSON()) {
            //const json = this.asJSON()
            //console.log(this.asJSON())
            //this.fromJSON(json)
        }
        */
    }

    /*
    asJSON () {
        const json = super.asJSON()
        json._label = this.label()
        return json
    }

    fromJSON (json) {
        const obj = super.fromJSON(json)
        obj.setLabel(json._label)
        return obj
    }

    */

    /*
    didChangeParentNode  () {
        super.didChangeParentNode()
        if (this.isFlexRoot()) {
            this.removeAction("delete")
        }
    }
    */

}.initThisClass()

