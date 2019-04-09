"use strict"

/*

    BMSounds

*/

window.BMImages = BMNode.extend().newSlots({
    type: "BMImages",
    appObservation:null,
}).setSlots({
    shared: function() {   
        return this.sharedInstanceForClass(BMImages)
    },

    init: function () {
        BMNode.init.apply(this)

        this.setTitle("Images")
        this.setNodeMinWidth(270)
        this.setSubnodeProto(BMURLImage)

        const obs = NotificationCenter.shared().newObservation().setName("appDidInit").setObserver(this)
        obs.setIsOneShot(true).watch()
        
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
