"use strict"

/*

    BMMinuteNode 
    
*/

BMNode.newSubclassNamed("BMMinuteNode").newSlots({
    value: 1, // day value starts with 1
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
        assert(Number.isInteger(v) && v > -1 && v < 60)
        this._value = v
        return this
    },

    minuteName: function() {
        let s = this.value()
        if (s < 10) { 
            s = "0" + s
        }
        return s
    },

    title: function() {
        return this.minuteName()
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
})
