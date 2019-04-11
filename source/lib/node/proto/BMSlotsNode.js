"use strict"

/*

    BMSlotsNode
    
*/

//window.BMSlotsNode = BMFieldSetNode.extend().newSlots({
window.BMSlotsNode = BMNode.extend().newSlots({
    type: "BMSlotsNode",
    protoValue: null,
}).setSlots({
    init: function () {
        //BMFieldSetNode.init.apply(this)
        BMNode.init.apply(this)
 		//this.setShouldStore(false)
        this.setNodeMinWidth(600)
        this.setTitle("slots")
    },

    slotValueType: function() {
        let v = this.slotValue()
        let t = typeof(v)
        
        if (t === "object") {
            if (Type.isFunction(v.type)) {
                t = "prototype"
            }
        }

        return t
    },

    setupSubnodes: function() {
        let childNodes = []
        const protoValue = this.protoValue()
        assert(protoValue)

        protoValue.slotNames().sort().forEach((slotName) => {

            let childNode = null
            const v = protoValue[slotName]
            const t = typeof(v)

            const slotNode = BMSlotNode.clone()
            slotNode.setProtoValue(protoValue)
            slotNode.setSlotName(slotName)
            slotNode.setSlotValue("[value]")
            childNodes.push(slotNode)

            // console.log("proto: ", p.type(), " slot:", slotName, " value: ", p[slotName], " type: ", t)

            /*
            if (t === "string") {
                childNode = this.addFieldNamed(slotName).setValueMethod("slotValue").setValueIsEditable(false)
                childNode.setTarget(slotNode)
                //childNode.setSubtitle("string")
            } 
            else if (t === "number") {
                childNode = this.addField(BMNumberField.clone().setValueMethod("slotValue").setValueIsEditable(false))
                childNode.setTarget(slotNode)
                //childNode.setSubtitle("number")
            } else if (t === "function") {
                childNode = this.addField(BMPointerField.clone().setValueMethod("slotValue").setValueIsEditable(false))
                childNode.setTarget(slotNode)
                //const functionNode = BMFunctionNode.clone()
                //childNode.setValue(functionNode)
                //childNode.setSubtitle("function")
            }
           
            if (childNode) {
                childNodes.push(childNode)
            }
            */
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