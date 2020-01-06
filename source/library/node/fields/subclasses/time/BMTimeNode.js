"use strict"

/*

    BMTimeNode
    
    

*/
        
window.BMTimeNode = class BMTimeNode extends BMSummaryNode {
    
    initPrototype () {
        this.newSlot("hour", null)
        this.newSlot("minute", null)
        this.newSlot("timezone", null)
        this.newSlot("formatter", null)

        this.setShouldStore(true)
        this.setShouldStoreSubnodes(false)
        this.setNodeCanReorderSubnodes(false)
        this.setCanDelete(true)

        this.setTitle("Time")

        this.protoAddStoredSlot("title")
        this.protoAddStoredSlot("hour")
        this.protoAddStoredSlot("minute")

        this.setNodeCanEditTitle(true)
        this.setNodeCanEditSubtitle(false)
    }

    init () {
        super.init()


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
