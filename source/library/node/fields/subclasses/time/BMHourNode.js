"use strict"

/*

    BMHourNode 
    
*/

BMNode.newSubclassNamed("BMHourNode").newSlots({
    value: 0, // 0 to 23
}).setSlots({
    
    init: function () {
        BMNode.init.apply(this)

        this.setCanDelete(false)
        this.setNodeCanInspect(false)
        this.setNodeMinWidth(300)

        this.setNodeCanEditTitle(false)
        this.setNodeCanReorderSubnodes(false)
    },

    setValue: function(v) {
        assert(Number.isInteger(v) && v > -1 && v < 23)
        this._value = v
        return this
    },

    meridiemName: function() {
        if (this.value() > 11) {
            return "pm"
        }
        return "am"
    },

    hourName: function() {
        let v = this.value() % 12
        if (v === 0) { v = 12 }
        return v + "" + this.meridiemName()
    },

    title: function() {
        return this.hourName()
    },

    subtitle: function() {
        return null
    },
    
    note: function() {
        return "&gt;"
    },
    
    /*
    nodeRowLink: function() {
        return this
    },    
    */

    prepareToSyncToView: function() {
        // called after clicked
        if (!this.hasSubnodes()) {
            for (let i = 0; i < 60; i += 5) {
                const minute = BMMinuteNode.clone().setValue(i)
                this.addSubnode(minute)
            }
        }
    },
})
