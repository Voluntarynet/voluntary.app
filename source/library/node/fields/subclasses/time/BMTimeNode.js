"use strict"

/*

    BMTimeNode
    
    

*/
        
window.BMTimeNode = class BMTimeNode extends BMSummaryNode {
    
    initPrototype () {
        this.newSlots({
            hour: null,
            minute: null,
            timezone: null,
            formatter: null,
        })
    }

    init () {
        super.init()
        this.setShouldStore(true)
        this.setShouldStoreSubnodes(false)
        this.setNodeCanReorderSubnodes(false)
        this.setCanDelete(true)

        this.setTitle("Time")

        this.addStoredSlot("title")
        this.addStoredSlot("hour")
        this.addStoredSlot("minute")

        this.setNodeCanEditTitle(true)
        this.setNodeCanEditSubtitle(false)

        this.setFormatter(TimeFormatter.clone())
        return this
    }

    hasTime () {
        return !Type.isNull(this.hour())
    }

    jsDate () {
        //new Date(year, month, day, hours, minutes, seconds, milliseconds)
        if (this.hasTime()) {
            const d = new Date(0, 0, 0, this.hour(), this.minute(), 0, 0, 0)
            return d
        }
        return null
    }

    timeString () {
        return this.formatter().setDate(this.jsDate()).formattedValue()
    }

    subtitle () {
        if (this.hasTime()) {
            return this.timeString()
        }

        return "No time selected"
    }

    note () {
        return "&gt;"
    }

    prepareToSyncToView () {
        // called after clicked
        if (!this.hasSubnodes()) {
            for (let i = 0; i < 23; i++) {
                const hour = BMHourNode.clone().setValue(i)
                this.addSubnode(hour)
            }
        }
    }

    onRequestSelectionOfDecendantNode (aNode) {
        if (aNode.type() === "BMMinuteNode") {
            const minuteNode = aNode
            const hourNode = minuteNode.parentNode()
            this.setHour(hourNode.value())
            this.setMinute(minuteNode.value())
            this.scheduleSyncToView()
            this.parentNode().postShouldFocusSubnode(this)
        }
        return true
    }

}.initThisClass()
