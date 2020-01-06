"use strict"

/*

    BMMinuteNode 
    
*/

window.BMMinuteNode = class BMMinuteNode extends BMNode {
    
    initPrototype () {
        this.newSlot("value", 1)
    }

    init () {
        super.init()
        this.setCanDelete(false)
        this.setNodeCanInspect(false)
        this.setNodeMinWidth(300)
        this.setNodeCanEditTitle(false)
        this.setNodeCanReorderSubnodes(false)
    }

    setValue (v) {
        assert(Number.isInteger(v) && v > -1 && v < 60)
        this._value = v
        return this
    }

    minuteName () {
        let s = this.value()
        if (s < 10) { 
            s = "0" + s
        }
        return s
    }

    title () {
        return this.minuteName()
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
