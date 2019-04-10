"use strict"

/*

    BMSoundResurces

*/

window.BMImageResources = BMNode.extend().newSlots({
    type: "BMImageResources",
    appObservation:null,
}).setSlots({
    shared: function() {   
        return this.sharedInstanceForClass(BMImageResources)
    },

    init: function () {
        BMNode.init.apply(this)

        this.setTitle("Images")
        this.setNodeMinWidth(270)
        this.setSubnodeProto(BMURLImage)
        
        return this
    },

    appDidInit: function() {
        this.setupSubnodes()
        return this
    },

    setupSubnodes: function() {
        const paths = JSImporter.imageFilePaths()

        paths.forEach((path) => {

            this.addImageWithPath(path)
        })

        return this
    },

    addImageWithPath: function(aPath) {
        const image = this.justAdd()
        image.setPath(aPath)
        return this
    },

})
