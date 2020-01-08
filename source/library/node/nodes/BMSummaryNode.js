"use strict"

/*
    
    BMSummaryNode
    
    A node that contains Text, stores it's:
        content, color, font, padding, margin
    and has an inspector for these attributes
    
    support for links?

*/

window.BMSummaryNode = class BMSummaryNode extends BMStorableNode {
    
    initPrototype () {
        this.newSlot("nodeSummaryJoiner", " ").setShouldStoreSlot(true).setDuplicateOp("copyValue")
        this.newSlot("nodeSubtitleIsChildrenSummary", false).setShouldStoreSlot(true).setDuplicateOp("copyValue")
        this.newSlot("summaryFormat", "value").setShouldStoreSlot(true).setDuplicateOp("copyValue")
    
        this.setShouldStore(true)
        this.setShouldStoreSubnodes(true)

        this.setTitle("title")
        this.protoAddStoredSlot("title")
    }

    init () {
        super.init()
    }

    initNodeInspector () {
        super.initNodeInspector()
        this.addInspectorField(BMStringField.clone().setKey("Summary joiner").setValueMethod("nodeSummaryJoiner").setValueIsEditable(true).setTarget(this))
        this.addInspectorField(BMBooleanField.clone().setKey("Subtitle is children summary").setValueMethod("nodeSubtitleIsChildrenSummary").setValueIsEditable(true).setTarget(this))
        this.addInspectorField(this.summaryFormatOptionsNode())
        return this
    }

    didUpdateSlotSummaryFormat () {
        this.didUpdateNode()
    }

    summaryFormatOptionsNode () {
        const sm = BMOptionsNode.clone().setKey("Summary format").setValueMethod("summaryFormat").setValueIsEditable(true).setTarget(this)
        sm.setTitle("Summary format *")
        
        const formats = ["none", "key", "value", "key value", "value key"]

        formats.forEach((format) => {
            sm.addSubnode(BMOptionNode.clone().setTitle(format))
        })
        return sm
    }

    summaryKey () {
        return this.title()
    }

    summaryValue () {
        return this.subtitle()
    }

    subtitle () {
        if (this.nodeSubtitleIsChildrenSummary()) {
            return this.childrenSummary()
        }

        return super.subtitle()
    }

    // --- summary ---
    		
    summary () {
        const k = this.summaryKey()
        let v = this.summaryValue()
        const f = this.summaryFormat()
        const j = this.nodeSummaryJoinerOut()

        if (Type.isNull(v)) {
            v = ""
        }

        if (f === "key") { 
            return k
        }
    
        if (f === "value") { 
            return v
        }

        if (f === "key value") { 
            return k + j + v
        }

        if (f === "value key") { 
            return v + j + k
        }

        return ""
    }
        
    childrenSummary () {
        return this.subnodes().map(subnode => subnode.summary()).filter(s => s.length).join(this.nodeSummaryJoinerOut())
    }

    nodeSummaryJoinerOut () {
        let s = this._nodeSummaryJoiner
        
        if (s === "newline") {
            return "<br>"
        } else {
            s = s.replaceAll("<br>", "")
        }
        
        return s
    }
    
}.initThisClass()

