"use strict"

/*

    BMDayNode 
    
*/

BMNode.newSubclassNamed("BMDayNode").newSlots({
    value: 1, // day value starts with 1
}).setSlots({
    
    init: function () {
        BMNode.init.apply(this)

        this.setCanDelete(false)
        this.setNodeCanInspect(false)
        this.setNodeMinWidth(300)

        this.setTitle("a day")
        this.setNodeCanEditTitle(false)

        this.setNodeCanReorderSubnodes(false)
    },

    setValue: function(v) {
        assert(Number.isInteger(v) && v > 0 && v < 32)
        this._value = v
        return this
    },

    dayName: function() {
        const v = this.value()
        return v + v.ordinalSuffix()
    },

    title: function() {
        return this.dayName()
    },

    subtitle: function() {
        return null
    },
    
    note: function() {
        return null
    },
    
    nodeRowLink: function() {
        // used by UI row views to browse into next column
        return null
    },    
    
}).initThisProto()
