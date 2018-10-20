"use strict"

window.BMThemeClass = BMStorableNode.extend().newSlots({
    type: "BMThemeClass",
}).setSlots({
    init: function () {
        BMStorableNode.init.apply(this)
        this.setShouldStore(true)
        //this.setSubtitle("class")
        this.setNodeMinWidth(200)
        this.setupSubnodes()
    },

    setupSubnodes: function() {
        var classProto = window[this.title()]
        //var stateNames = classProto.stateNames()
        var stateNames = ["active", "inactive", "disabled"]
        var stateNodes = stateNames.map(function (stateName) {
            return BMThemeClassState.clone().setTitle(stateName)
        })
        this.setSubnodes(stateNodes);
        return this
    },


})
