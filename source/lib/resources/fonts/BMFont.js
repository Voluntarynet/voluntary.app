"use strict"

/*

    BMFont

    Managed by BMFontResources.

*/

BMNode.newSubclassNamed("BMFont").newSlots({
    path: null,
    name: null,
    options: null,
    isDebugging: false,
}).setSlots({
    init: function () {
        BMNode.init.apply(this)
        this.setNodeMinWidth(270)
        this.setOptions({})  // example options { style: 'normal', weight: 700 }  
        //this.setIsDebugging(true)
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

    // loading 

    load: function() {
        if (!window["FontFace"]) {
            console.warn("this browser is missing FontFace class")
            return this
        }

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

    onLoadError: function(error) {
        if (this.isDebugging()) {
            console.log(this.typeId() + ".onLoadError() ", error)
        }
        return this
    },

})
