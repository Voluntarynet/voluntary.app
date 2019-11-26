"use strict"

/*

    BMMonthNode 
    
*/

BMNode.newSubclassNamed("BMMonthNode").newSlots({
    value: 1, // month value starts with 1
}).setSlots({
    
    init: function () {
        BMNode.init.apply(this)

        this.setCanDelete(false)
        this.setNodeCanInspect(false)
        this.setNodeMinWidth(300)

        this.setTitle("a month")
        this.setNodeCanEditTitle(true)

        //this.setSubnodeProto(BMOptionNode)
        //this.setNodeCanReorderSubnodes(false)

        //this.setViewClassName("BMOptionsNodeView")
    },

    setValue: function(v) {
        assert(Number.isInteger(v) && v > 0 && v < 13)
        this._value = v
        return this
    },

    year: function() {
        const year = this.parentNode().value()
        return year
    },

    daysThisMonth: function() {
        return new Date(this.year(), this.value() - 1, 0).getDate();
    },

    monthNames: function() {
        return ["January", "February", "March", "April", 
            "May", "June", "July", "August", 
            "September", "October", "November", "December"];
    },

    monthName: function() {
        return this.monthNames()[this.value()-1]
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
        if (!this.subnodeCount()) {

            for (let i = 1; i < this.daysThisMonth() + 1; i++) {
                this.addSubnode(BMDayNode.clone().setValue(i))
            }
        }
    },
    
}).initThisProto()
