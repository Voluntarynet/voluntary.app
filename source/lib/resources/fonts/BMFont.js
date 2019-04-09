"use strict"

/*

    BMFont

    Managed by BMFontManager.

*/

window.BMFont = BMNode.extend().newSlots({
    type: "BMFont",
    path: null,
    name: null,
    options: null,
}).setSlots({
    init: function () {
        BMNode.init.apply(this)
        this.setNodeMinWidth(270)
        this.setOptions({})  // example options { style: 'normal', weight: 700 }  
    },

    title: function() {
        return this.name()
    },

    name: function() {
        if (this._name) {
            return this._name
        }

        return this.path().fileName()
    },

    /*
    setPath: function(aPath) {
        this._path = aPath
        //this.load()
        return this
    },
    */

    // loading 

    load: function() {
        const urlString = "url('" + this.path() + "')"
        const aFontFace = new FontFace(this.name(), urlString, this.options()); 
        
        aFontFace.load().then((loadedFace) => {
            this.didLoad()
            assert(loadedFace === aFontFace)
            document.fonts.add(loadedFace)
        }).catch((error) => {
            this.onLoadError(error)
        });

        return this
    },

    didLoad: function() {
        if (this.isDebugging()) {
            console.log(this.typeId() + ".didLoad(" + this.name() + ") " + this.path())
            //console.log(this.typeId() + ".didLoad('" + this.name() + "')")
        }
        return this
    },

    onLoadError: function() {
        if (this.isDebugging()) {
            console.log(this.typeId() + ".onLoadError() ", error)
        }
        return this
    },

})
