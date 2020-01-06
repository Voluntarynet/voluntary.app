"use strict"

/*

    BMDayNode 
    
*/

window.BMDayNode = class BMDayNode extends BMNode {
    
    initPrototype () {
        this.newSlot("value", 1).setComment("day value starts with 1")
    }

    init () {
        super.init()

        this.setCanDelete(false)
        this.setNodeCanInspect(false)
        this.setNodeMinWidth(300)

        this.setTitle("a day")
        this.setNodeCanEditTitle(false)

        this.setNodeCanReorderSubnodes(false)
    }

    setValue (v) {
        assert(Number.isInteger(v) && v > 0 && v < 32)
        this._value = v
        return this
    }

    dayName () {
        const v = this.value()
        return v + v.ordinalSuffix()
    }

    title () {
        return this.dayName()
    }

    subtitle () {
        return null
    }
    
    note () {
        return null
    }
    
    nodeRowLink () {
        // used by UI row views to browse into next column
        return null
    }
    
}.initThisClass()
