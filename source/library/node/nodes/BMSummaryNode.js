"use strict"

/*
    
    BMSummaryNode
    
    A node that contains Text, stores it's:
        content, color, font, padding, margin
    and has an inspector for these attributes
    
    support for links?

*/


BMStorableNode.newSubclassNamed("BMSummaryNode").newSlots({
    nodeSummaryJoiner: " ",
    nodeSubtitleIsChildrenSummary: false,
    summaryFormat: "value",
}).setSlots({
    init: function () {
        BMStorableNode.init.apply(this)
        this.setShouldStore(true)
        this.setShouldStoreSubnodes(true)

        this.setTitle("title")
        this.addStoredSlot("title")

        this.addStoredSlot("nodeSummaryJoiner")  // TODO: move elsewhere
        this.addStoredSlot("nodeSubtitleIsChildrenSummary") 
        this.addStoredSlot("summaryFormat")
    },

    shallowCopySlotnames: function() {
        const names = BMStorableNode.shallowCopySlotnames.apply(this)
        return names.appendItems([
            "nodeSummaryJoiner", "nodeSubtitleIsChildrenSummary", "summaryFormat", 
        ])
    },

    initNodeInspector: function() {
        BMStorableNode.initNodeInspector.apply(this)
        this.addInspectorField(BMStringField.clone().setKey("Summary joiner").setValueMethod("nodeSummaryJoiner").setValueIsEditable(true).setTarget(this))
        this.addInspectorField(BMBooleanField.clone().setKey("Subtitle is children summary").setValueMethod("nodeSubtitleIsChildrenSummary").setValueIsEditable(true).setTarget(this))
        this.addInspectorField(this.summaryFormatOptionsNode())
        return this
    },

    setSummaryFormat: function(f) {
        this.didUpdateSlot("summaryFormat", this._summaryFormat, f)
        this._summaryFormat = f
        this.didUpdateNode()
        return this
    },

    summaryFormatOptionsNode: function() {
        const sm = BMOptionsNode.clone().setKey("Summary format").setValueMethod("summaryFormat").setValueIsEditable(true).setTarget(this)
        sm.setTitle("Summary format *")
        
        const formats = ["none", "key", "value", "key value", "value key"]

        formats.forEach((format) => {
            sm.addSubnode(BMOptionNode.clone().setTitle(format))
        })
        return sm
    },

    summaryKey: function() {
        return this.title()
    },

    summaryValue: function() {
        return this.subtitle()
    },

    subtitle: function () {
        if (this.nodeSubtitleIsChildrenSummary()) {
            return this.childrenSummary()
        }

        return BMStorableNode.subtitle.apply(this)
    },

    // --- summary ---
    		
    summary: function() {
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
    },
        
    childrenSummary: function() {
        return this.subnodes().map(subnode => subnode.summary()).filter(s => s.length).join(this.nodeSummaryJoinerOut())
    },

    nodeSummaryJoinerOut: function() {
        let s = this._nodeSummaryJoiner
        
        if (s === "newline") {
            return "<br>"
        } else {
            s = s.replaceAll("<br>", "")
        }
        
        return s
    },
})

