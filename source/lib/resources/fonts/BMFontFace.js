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
        //const aFontFace = new FontFace(name, urlString, options); 
        const aFontFace = new FontFace("AppLight", urlString, options); 

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

/*
function setFontTo(fontName) {
    const styleId = 'font-style-sheet';
  
    // Get a reference to the current in-use stylesheet, if there is one.
    var fontStyleSheet = document.getElementById(styleId);
  
    // Then define a new stylesheet with an updated @font-face rule:
    var newFontStyleSheet = document.createElement("style");
    newFontStyleSheet.id = styleId;
    newFontStyleSheet.textContent = `
      @font-face {
        font-family: 'main-dynamic-font';
        src: url(assets/fonts/${fontName}.woff) format('woff');
      }
    `;
  
    // Then we swap: add the new rule first, then remove the old one.
    // That way you don't get a flash of unstyled text.
    document.head.appendChild(newFontStyleSheet);
  
    if (fontStyleSheet) {
      fontStyleSheet.parent.removeChild(fontStyleSheet);
    }
  }
  */