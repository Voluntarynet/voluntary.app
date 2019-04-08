"use strict"

/*

    BMTheme

*/

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
        setTimeout(() => { 
            //console.log("theme as json: ", JSON.stringify(this.asJSON())) 
        }, 1000)
    },

    loadFinalize: function() {
        // called after all objects loaded within this event cycle
        this.setupSubnodes()
    },

    setupSubnodes: function() {
        // setup with all view classes
        
        let viewClasses = DomView.allDescendantProtos()

        viewClasses = viewClasses.select((viewClass) => {
            return ("styles" in viewClass)
        }).select((viewClass) => { return !viewClass.styles().isEmpty() })

        //console.log("viewClasses:", viewClasses)
        let themeClasses = viewClasses.map((childProto) => {
            return BMThemeClass.clone().setTitle(childProto.type());
        })

        this.setSubnodes(themeClasses);
        return this
    },

})
