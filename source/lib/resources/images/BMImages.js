"use strict"

/*

    BMSounds

*/

window.BMImages = BMNode.extend().newSlots({
    type: "BMImages",
    appDidInitObservation:null,
}).setSlots({
    shared: function() {   
        return this.sharedInstanceForClass(BMImages)
    },

    init: function () {
        BMNode.init.apply(this)

        this.setTitle("Images")
        this.setNodeMinWidth(270)

        const obs = NotificationCenter.shared().newObservation().setName("appDidInit").setObserver(this).watch()
        this.setAppDidInitObservation(obs)
        
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
        const image = BMImage.clone().setPath(aPath)
        this.addImage(image)
        return this
    },

    addImage: function(anImage) {
        this.addSubnode(anImage)
        return this
    },

    images: function() {
        return this.subnodes()
    },

})
