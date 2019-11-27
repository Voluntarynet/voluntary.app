"use strict"

/*

    BMOptionsNode 
    
*/

window.BMOptionsNode = class BMOptionsNode extends BMField {
    
    initPrototype () {
        this.newSlots({
            allowsMultiplePicks: false,
        })
    }

    init () {
        super.init()

        this.setSummaryFormat("value")

        this.setShouldStore(true)
        this.addStoredSlot("key")
        this.setShouldStoreSubnodes(true)

        this.setCanDelete(true)
        this.setNodeCanInspect(true)
        this.addAction("add")
        this.setNodeMinWidth(300)

        this.setTitle("Options title")
        this.setKeyIsVisible(true)
        this.setNodeCanEditTitle(true)

        //this.setSubtitle("subtitle")
        //this.setNodeCanEditSubtitle(true)

        //this.setSubnodeProto(BMMenuNode)
        this.setSubnodeProto(BMOptionNode)
        this.setNodeCanReorderSubnodes(true)
        this.addStoredSlot("allowsMultiplePicks")


        //this.setViewClassName("BMOptionsNodeView")
    }

    shallowCopySlotnames () {
        const names = super.shallowCopySlotnames()
        return names.appendItems([
            "allowsMultiplePicks", 
        ])
    }

    initNodeInspector () {
        super.initNodeInspector()
        this.addInspectorField(BMBooleanField.clone().setKey("Multiple picks").setValueMethod("allowsMultiplePicks").setValueIsEditable(true).setTarget(this))
        return this
    }

    /*
    setValue (v) {
        super.setValue(v)
        return this
    }
    */
    

    key () {
        return this.title()
    }
    
    /*
    summary () {
        let s = ""
        if (this.nodeSummaryShowsKey()) {
            s += this.title() + ": "
        }
        return s + this.childrenSummary()
    }
    */

    childrenSummary () {
        const picked = this.pickedSubnodes()
        if (picked.length === 0) {
            return "None"
        }
        return picked.map(subnode => subnode.summary()).join(this.nodeSummaryJoiner())
    }

    setSubtitle (aString) {
        return this
    }

    didToggleOption (anOptionNode) {
        if (anOptionNode.isPicked() && !this.allowsMultiplePicks()) {
            this.unpickSubnodesExcept(anOptionNode)
        }

        let pickedValues = this.pickedSubnodes().map(s => s.value())
        //this.setValue(pickedValues)
        
        if (pickedValues.length) {
            if (this.allowsMultiplePicks()) {
                this.setValue(pickedValues)
            } else {
                this.setValue(pickedValues.first())
            }
        } else {
            this.setValue(null)
        }

        return this
    }

    unpickSubnodesExcept (anOptionNode) {
        this.subnodes().forEach(subnode => {
            if (subnode !== anOptionNode) { 
                subnode.setIsPicked(false) 
            }
        })
        return this
    }

    pickedSubnodes () {
        return this.subnodes().select(subnode => subnode.isPicked())
    }

    acceptedSubnodeTypes () {
        return [BMOptionNode.type()]
    }
    
    note () {
        return "&gt;"
    }

    /*
    setValidValues (values) {        
        const options = values.map(v => BMOptionNode.clone().setValue(v))
        this.setSubnodes(options)
        return this
    }
	
    validValues () {
        return this.subnodes().map(sn => sn.value())
    }
    */
    
    nodeRowLink () {
        // used by UI row views to browse into next column
        return this
    }
    
}.initThisClass()
