"use strict"

/*

    BMDayNode 
    
*/

BMNode.newSubclassNamed("BMDayNode").newSlots({
    value: 0,
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

    dayName: function() {
        const v = this.value() + 1
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
})
