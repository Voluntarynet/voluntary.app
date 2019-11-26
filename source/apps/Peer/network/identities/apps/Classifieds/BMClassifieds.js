"use strict"

/*

    BMClassifieds

*/

BMApplet.newSubclassNamed("BMClassifieds").newSlots({
    regions: null,
    sells: null,
}).setSlots({
    init: function () {
        BMApplet.init.apply(this)
        this.setTitle("Classifieds")
        
        this.setRegions(BMRegions.clone())
        this.addSubnode(this.regions())
        
        //this.setSells(this.defaultStore().rootInstanceWithPidForProto("BMClassifieds_sells", BMSells)) // move to pid for classifieds
        this.setSells(BMSells.clone()) // move to pid for classifieds
        this.addSubnode(this.sells())
    },

}).initThisProto()

