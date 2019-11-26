"use strict"

/*

    BMPointerField

    A field that's a pointer to another node.
    (sometimes the other node is used as a list of items, but not always)

*/
        
BMField.newSubclassNamed("BMPointerField").newSlots({
}).setSlots({
    init: function () {
        BMField.init.apply(this)
        this.setKeyIsEditable(false)
        this.setValueIsEditable(false)
        this.setKeyIsVisible(true)
        this.setValueIsVisible(true)
        this.setNodeRowIsSelectable(true)
    },

    setValue: function(v) {
        console.warn("WARNING: BMPointerField setValue '" + v + "'")
        return this
    },

    title: function() {
        return this.value().title()
    },
	
    subtitle: function() {
        return this.value().subtitle()
    },
	
    note: function() {
        return this.value().note()
    },
	
    nodeRowLink: function() {
        return this.value()
    },

}).initThisProto()
