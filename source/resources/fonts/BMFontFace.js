"use strict"

/*

    BMFontFace

    Uses FontFace API to load a font file with a particular set of options.

*/


window.BMFontFace = BMNode.extend().newSlots({
    type: "BMFontFace",
    url: "https://fonts.googleapis.com/css?family=Open+Sans:400italic,400,300,700", // example
    options: {},
    isDebugging: false,
}).setSlots({
    init: function () {
        //this.setElementType("link") // TODO: use a method override instead?
        BMNode.init.apply(this)
        this.setOptions({})
    },

    name: function() {
        return this.url().fileName()
    },

    setUrl: function(aUrlString) {
        this._url = aUrlString
        this.load()
        return this
    },

    load: function() {
        const name = this.url().fileName()
        const urlString = "url('" + this.url() + "')"
        const options = this.options() // example options { style: 'normal', weight: 700 }
        const aFontFace = new FontFace(name, urlString, options); 

        aFontFace.load().then((loadedFace) => {
            this.didLoad()
        }).catch((error) => {
            this.onLoadError(error)
        });

        return this
    },

    didLoad: function() {
        if (this.isDebugging()) {
            console.log(this.typeId() + ".didLoad(" + this.name() + ") " + this.url())
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
