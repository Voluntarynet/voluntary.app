"use strict"

/*

    BMClassifieds

*/

window.BMClassifieds = class BMClassifieds extends BMApplet {
    
    initPrototype () {
        this.newSlot("regions", null)
        this.newSlot("sells", null)
    }

    init () {
        super.init()
        this.setTitle("Classifieds")
        
        this.setRegions(BMRegions.clone())
        this.addSubnode(this.regions())
        
        //this.setSells(this.defaultStore().rootInstanceWithPidForProto("BMClassifieds_sells", BMSells)) // move to pid for classifieds
        this.setSells(BMSells.clone()) // move to pid for classifieds
        this.addSubnode(this.sells())
    }

}.initThisClass()

