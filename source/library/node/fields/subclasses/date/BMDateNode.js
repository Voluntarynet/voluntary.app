"use strict"

/*

    BMDateNode
    
    

*/
        
window.BMDateNode = class BMDateNode extends BMSummaryNode {
    
    initPrototype () {
        this.protoAddStoredSlot("title")

        this.newSlot("year", null).setShouldStoreSlot(true)
        this.newSlot("month", null).setShouldStoreSlot(true)
        this.newSlot("day", null).setShouldStoreSlot(true)

        this.setShouldStore(true)
        this.setShouldStoreSubnodes(false)
        this.setNodeCanReorderSubnodes(false)
        this.setCanDelete(true)

        this.setTitle("Date")
        this.setNodeCanEditTitle(true)
        this.setNodeCanEditSubtitle(false)
    }

    init () {
        super.init()
    }

    hasDate () {
        return !Type.isNull(this.year())
    }

    jsDate () {
        //new Date(year, month, day, hours, minutes, seconds, milliseconds)
        if (this.hasDate()) {
            const d = new Date(this.year(), this.month(), this.day(), 0, 0, 0, 0, 0)
            //console.log("d = ", d)
            return d
        }
        return null
    }

    subtitle () {
        if (this.hasDate()) {
            const d = this.jsDate()
            const s = d.monthName() + " " + d.dateNumberName() + ", " + d.getFullYear()
            //const s2 = [this.year(), this.month(), this.day()].join(", ")
            //return s2 + " - " + s
            return s
        }

        return "No date selected"
    }

    note () {
        return "&gt;"
    }

    prepareToSyncToView () {
        // called after DateNode is selected
        if (!this.hasSubnodes()) {
            const startYear = 2019
            const yearRange = 3
            for (let i = startYear; i < startYear + yearRange; i++) {
                const year = BMYearNode.clone().setValue(i)
                this.addSubnode(year)
            }
        }
    }

    onRequestSelectionOfDecendantNode (aNode) {
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
    }

}.initThisClass()
