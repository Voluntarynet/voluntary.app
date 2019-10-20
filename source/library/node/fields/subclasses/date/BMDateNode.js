"use strict"

/*

    BMDateNode
    
    

*/
        
BMStorableNode.newSubclassNamed("BMDateNode").newSlots({
    year: null,
    month: null,
    day: null,
}).setSlots({
    init: function () {
        BMStorableNode.init.apply(this)
        this.setShouldStore(true)
        this.setShouldStoreSubnodes(false)
        this.setNodeCanReorderSubnodes(false)
        this.setCanDelete(true)

        this.setTitle("Date")

        this.addStoredSlot("title")
        this.addStoredSlot("year")
        this.addStoredSlot("month")
        this.addStoredSlot("day")

        this.setNodeCanEditTitle(true)
        this.setNodeCanEditSubtitle(false)

        return this
    },

    hasDate: function() {
        return !Type.isNull(this.year())
    },

    jsDate: function() {
        //new Date(year, month, day, hours, minutes, seconds, milliseconds)
        if (this.hasDate()) {
            let d = new Date(this.year(), this.month(), this.day(), 0, 0, 0, 0, 0)
            //console.log("d = ", d)
            return d
        }
        return null
    },

    subtitle: function() {
        if (this.hasDate()) {
            const d = this.jsDate()
            const s = d.monthName() + " " + d.dateNumberName() + ", " + d.getFullYear()
            //const s2 = [this.year(), this.month(), this.day()].join(", ")
            //return s2 + " - " + s
            return s
        }

        return "No date selected"
    },

    note: function() {
        return "&gt;"
    },

    prepareToSyncToView: function() {
        // called after DateNode is selected
        if (!this.hasSubnodes()) {
            const startYear = 2019
            const yearRange = 3
            for (let i = startYear; i < startYear + yearRange; i++) {
                const year = BMYearNode.clone().setValue(i)
                this.addSubnode(year)
            }
        }
    },

    onRequestSelectionOfDecendantNode: function(aNode) {
        if (aNode.type() === "BMDayNode") {
            const dayNode = aNode
            const monthNode = dayNode.parentNode()
            const yearNode = monthNode.parentNode()
            this.setDay(dayNode.value())
            this.setMonth(monthNode.value())
            this.setYear(yearNode.value())
            this.scheduleSyncToView()
            this.parentNode().postShouldFocusSubnode(this)
        }
        return true
    },

})
