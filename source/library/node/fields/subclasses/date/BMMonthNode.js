"use strict"

/*

    BMMonthNode 
    
*/

BMNode.newSubclassNamed("BMMonthNode").newSlots({
    value: 0, // UTC month numbers, starts at 0, ends at 11
}).setSlots({
    
    init: function () {
        BMNode.init.apply(this)

        this.setCanDelete(false)
        this.setNodeCanInspect(true)
        this.setNodeMinWidth(300)

        this.setTitle("a month")
        this.setNodeCanEditTitle(true)

        //this.setSubtitle("subtitle")
        //this.setNodeCanEditSubtitle(true)
        //this.setSubnodeProto(BMMenuNode)
        this.setSubnodeProto(BMOptionNode)
        this.setNodeCanReorderSubnodes(true)

        //this.setViewClassName("BMOptionsNodeView")
    },

    year: function() {
        const year = this.parentNode().value()
        return year
    },

    daysThisMonth: function() {
        return new Date(this.year(), this.value(), 0).getDate();
    },

    monthNames: function() {
        return ["January", "February", "March", "April", 
            "May", "June", "July", "August", 
            "September", "October", "November", "December"];
    },

    monthName: function() {
        return this.monthNames()[this.value()]
    },

    title: function() {
        return this.monthName()
    },

    zeroPaddedMonthNumber: function() {
        let v = this.value()
        if (v < 10) { 
            v = "0" + v 
        }
        return v
    },

    subtitle: function() {
        //return this.zeroPaddedMonthNumber()
        return null
    },

    note: function() {
        return "&gt;"
    },
    
    nodeRowLink: function() {
        // used by UI row views to browse into next column
        return this
    },    

    prepareToSyncToView: function() {
        // called after Node is selected
        if (!this.subnodes().length) {

            for (let i = 0; i < this.daysThisMonth(); i++) {
                this.addSubnode(BMDayNode.clone().setValue(i))
            }
        }
    },
})
