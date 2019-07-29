"use strict"

/*

    BMSoundResurces

*/

BMNode.newSubclassNamed("BMImageResources").newSlots({
    extensions: ["png", "jpg", "jpeg", "gif", "tiff", "bmp"],
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

    resourcePaths: function() {
        return ResourceLoader.resourceFilePathsWithExtensions(this.extensions())
    },
    
    appDidInit: function() {
        this.setupSubnodes()
        return this
    },

    setupSubnodes: function() {
        this.resourcePaths().forEach(path => this.addImageWithPath(path))
        return this
    },

    addImageWithPath: function(aPath) {
        const image = this.justAdd()
        image.setPath(aPath)
        return this
    },

})
