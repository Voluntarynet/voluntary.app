"use strict"

/*

    BMSlotsNode
    
*/

window.BMSlotsNode = BMFieldSetNode.extend().newSlots({
    type: "BMSlotsNode",
    protoValue: null,
}).setSlots({
    init: function () {
        BMFieldSetNode.init.apply(this)
 		this.setShouldStore(false)
        this.setNodeMinWidth(600)
        this.setTitle("slots")
    },

    slotValueType: function() {
        let v = this.slotValue()
        let t = typeof(v)
        
        if (t === "object") {
            if (typeof(v.type) === "function") {
                t = "prototype"
            }
        }

        return t
    },

    setupSubnodes: function() {
        let childNodes = []
        assert(this.protoValue())

        this.protoValue().slotNames().forEach((slotName) => {

            let childNode = null
            let p = this.protoValue()
            let v = p[slotName]
            let t = typeof(v)
            // console.log("proto: ", p.type(), " slot:", slotName, " value: ", p[slotName], " type: ", t)

            if (t === "string") {
                childNode = this.addFieldNamed(slotName).setValueMethod("slotValue").setValueIsEditable(false)
                //childNode.setSubtitle("string")
            }

            if (t === "number") {
                childNode = this.addField(BMNumberField.clone().setValueMethod("slotValue").setValueIsEditable(false))
                //childNode.setSubtitle("number")
            }

            if (t === "function") {
                childNode = this.addField(BMPointerField.clone().setValueMethod("slotValue").setValueIsEditable(false))
                //childNode.setSubtitle("function")
            }

            if (childNode) {
                childNodes.push(childNode)
            }
        })

        this.setSubnodes(childNodes);
        return this
    },

    prepareForFirstAccess: function () {
        if (this._subnodes.length === 0) {
            this.setupSubnodes()
        }
    },
})