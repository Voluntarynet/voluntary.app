"use strict"


/*

    BMAudioPlayer

    Adds a body element like this:

      <audio id="audio" autoplay>
        <source id="audioSource" src="sounds/test.mp3" type="audio/mpeg"/ >
      </audio>

*/

window.BMAudioPlayer = DomView.extend().newSlots({
    type: "BMAudioPlayer",
    path: null,
    name: null,
    sourceElement: null,
}).setSlots({

    shared: function() {   
        const shared =  this.sharedInstanceForClass(BMAudioPlayer)
        shared.addToDocumentIfNeeded()
        return shared
    },

    addToDocumentIfNeeded: function() {   
        const d = DocumentBody.shared()
        if (!d.hasSubview(this)) {
            d.addSubview(this)
            this.setVisibility("hidden");
        }
        return this
    },

    init: function () {
        this.setElementType("audio") // TODO: use a method override instead?
        DomView.init.apply(this)
    },

    name: function() {
        if (!this.path()) {
            return ""
        }
        return this.path().split("/").last().before(".")
    },

    pathExtension: function() {
        if (!this.path()) {
            return ""
        }
        return this.path().split("/").last().after(".")
    },

    createElement: function() {
        const e = document.createElement(this.elementType())
        e.setAttribute("autoplay", "");
        e.setAttribute("type", "audio/mpeg");
        e.appendChild(this.createSourceElement())
        return e
    },

    createSourceElement: function() {
        const e = document.createElement(this.elementType())
        e.setAttribute("src", "stylesheet");
        e.setAttribute("type", "audio/mpeg");
        this.setSourceElement(e)
        return e
    },

    audioTypeForExtension: function(extString) {
        const extToType = {
            "mp3": "audio/mpeg",
            "wav": "audio/wav",
            "mp4": "audio/mp4",
            "mpa": "audio/mp4",
            "ogg": "audio/ogg",
            "oga": "audio/ogg",
        }
        const type =  extToType[extString]
        assert(type)
        return type
    },

    setPath: function(aUrlString) {
        console.log(this.typeId() +  ".setPath:'" + aUrlString + "'")
        this.sourceElement().setAttribute("src", aUrlString);
        //console.log("pathExtension = ", this.pathExtension())
        const type = this.audioTypeForExtension(this.pathExtension());
        //console.log("type = ", type)
        this.sourceElement().setAttribute("type", type);
        //this.load() 
        return this
    },

    path: function() {
        return this.sourceElement().getAttribute("src");
    },

    load: function() {
        console.log(this.typeId() +  ".load path:'" + this.path() + "'")
        //setTimeout(() => { this.element().load() }, 10)
        //const promise = 
        this.element().load()
        /*
        promise.catch((e) => {
            console.log("audio load exception: ", e)
        })
        */
        return this
    },

    play: function() {
        const promise = this.element().play()
        promise.catch((e) => {
            console.log("audio play exception: ", e)
        })
        return this

    },

    pause: function() {
        this.element().pause()
        return this
    },

})
