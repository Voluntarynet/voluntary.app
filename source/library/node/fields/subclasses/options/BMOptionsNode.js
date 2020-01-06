"use strict"

/*

    BMOptionsNode 
    
*/

window.BMOptionsNode = class BMOptionsNode extends BMField {
    
    initPrototype () {
        this.newSlot("allowsMultiplePicks", false)

        this.setShouldStore(true)
        this.protoAddStoredSlot("key")
        this.setShouldStoreSubnodes(true)
        this.setCanDelete(true)
        this.setNodeCanInspect(true)
        this.setNodeMinWidth(300)

        this.setTitle("Options title")
        this.setKeyIsVisible(true)
        this.setNodeCanEditTitle(true)

        this.setNodeCanReorderSubnodes(true)
        this.protoAddStoredSlot("allowsMultiplePicks")
        //this.setSubnodeProto(BMMenuNode)
        //this.setViewClassName("BMOptionsNodeView")
        // shallowCopySlotnames "allowsMultiplePicks", 

    }

    init () {
        super.init()
        this.addAction("add")
        this.setSummaryFormat("value")
        this.setSubnodeProto(BMOptionNode)
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
        this.copySubnodes(options)
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
