"use strict"

/*

    BMThemeClass

*/

BMStorableNode.newSubclassNamed("BMThemeClass").newSlots({
}).setSlots({
    init: function () {
        BMStorableNode.init.apply(this)
        this.setShouldStore(true)
        //this.setSubtitle("class")
        this.setNodeMinWidth(200)
        this.setupSubnodes()
    },

    setupSubnodes: function() {
        let classProto = window[this.title()]
        //let stateNames = classProto.stateNames()
        let stateNames = ["active", "inactive", "disabled"]
        let stateNodes = stateNames.map(function (stateName) {
            return BMThemeClassState.clone().setDivClassName(stateName)
        })
        this.setSubnodes(stateNodes);
        return this
    },


})
