"use strict"

/*

    BMPointerField

    A field that's a pointer to another node.
  (sometimes the other node is used as a list of items, but not always)

*/
        
window.BMPointerField = class BMPointerField extends BMField {
    
    initPrototype () {

    }

    init () {
        super.init()
        this.setKeyIsEditable(false)
        this.setValueIsEditable(false)
        this.setKeyIsVisible(true)
        this.setValueIsVisible(true)
        this.setNodeRowIsSelectable(true)
    }

    /*
    setValue (v) {
        console.warn("WARNING: BMPointerField setValue '" + v + "'")
        return this
    }
    */

    title () {
        return this.value().title()
    }
	
    subtitle () {
        return this.value().subtitle()
    }
	
    note () {
        return this.value().note()
    }
	
    nodeRowLink () {
        return this.value()
    }

}.initThisClass()
