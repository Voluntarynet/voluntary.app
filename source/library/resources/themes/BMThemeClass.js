"use strict"

/*

    BMThemeClass

*/

window.BMThemeClass = class BMThemeClass extends BMStorableNode {
    
    initPrototype () {
        this.newSlots({
        })
    }

    init () {
        super.init()
        this.setShouldStore(true)
        //this.setSubtitle("class")
        this.setNodeMinWidth(200)
        this.setupSubnodes()
    }

    setupSubnodes () {
        const classProto = window[this.title()]
        //let stateNames = classProto.stateNames()
        const stateNames = ["active", "inactive", "disabled"]
        const stateNodes = stateNames.map(function (stateName) {
            return BMThemeClassState.clone().setDivClassName(stateName)
        })
        this.setSubnodes(stateNodes);
        return this
    }

}.initThisClass()
