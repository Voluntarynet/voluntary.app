"use strict"

/*
    
    BMTextNode
    
    A node that contains Text, stores it's:
        content, color, font, padding, margin
    and has an inspector for these attributes
    
    support for links?

*/

window.BMTextNode = class BMTextNode extends BMStorableNode {
    
    initPrototype () {
        this.newSlots({
            fontSize: null,
            color: null,
            backgroundColor: null,
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

        this.setSubnodeProto(BMCreatorNode)
        
        this.setNodeCanReorderSubnodes(true)
        this.addStoredSlot("title")
        this.addStoredSlot("fontSize")
        this.addStoredSlot("color")
        this.addStoredSlot("backgroundColor")

        this.setNodeCanEditRowHeight(true)
        this.setNodeCanEditColumnWidth(true)
        //this.setNodeUsesColumnBackgroundColor(false)
        this.addStoredSlot("nodeSubtitleIsChildrenSummary")

        this.setNodeColumnStyles(BMViewStyles.clone())
        //this.setNodeRowStyles(BMViewStyles.clone())
        this.customizeNodeRowStyles().setToBlackOnWhite().selected().setBackgroundColor("red")
    }

    initNodeInspector () {
        super.initNodeInspector()
        this.addInspectorField(BMNumberField.clone().setKey("Font size").setValueMethod("fontSize").setValueIsEditable(true).setTarget(this))
        this.addInspectorField(BMStringField.clone().setKey("color").setValueMethod("color").setValueIsEditable(true).setTarget(this))
        this.addInspectorField(BMStringField.clone().setKey("Background color").setValueMethod("backgroundColor").setValueIsEditable(true).setTarget(this))
        return this
    }

    didLoadFromStore () {
        super.didLoadFromStore()
        this.subnodes().forEach( (subnode) => { subnode.setCanDelete(true) });
        this.subnodes().forEach( (subnode) => { subnode.setNodeCanInspect(true) });
        return this
    }

    acceptedSubnodeTypes () {
        return BMCreatorNode.fieldTypes()
    }

    onDidEdit (aView) {
        this.setFontSize(this.titleView().computedFontSize())
        this.setColor(this.titleView().computedColor())
        this.setBackgroundColor(this.titleView().computedBackgroundColor())
        return true
    }

}.initThisClass()

