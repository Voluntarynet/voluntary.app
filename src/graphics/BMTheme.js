"use strict"

window.BMTheme = BMStorableNode.extend().newSlots({
    type: "BMTheme",
}).setSlots({
    init: function () {
        BMStorableNode.init.apply(this)
        this.setShouldStore(true)

        this.setNodeTitleIsEditable(true)

        this.setTitle("Untitled Theme")
        this.setNodeMinWidth(270)
        this.setupSubnodes()

        this.addAction("delete")
    },

    loadFinalize: function() {
        // called after all objects loaded within this event cycle
        this.setupSubnodes()
    },

  
    setupSubnodes: function() {
        // setup with all view classes
        
        var viewClasses = DivView.allDescendantProtos()
        //console.log("viewClasses:", viewClasses)
        var childNodes = viewClasses.map((childProto) => {
            return BMThemeClass.clone().setTitle(childProto.type());
        })

        this.setSubnodes(childNodes);
        return this
    },

})
