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
    path: "",
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
        return this.path().fileName()
    },

    createElement: function() {
        const e = document.createElement("audio")
        e.setAttribute("autoplay", "");
        //e.setAttribute("type", "audio/mpeg");
        e.appendChild(this.createSourceElement())

        e.addEventListener('playing', () => { this.onPlaying(); },false); 

        return e
    },

    onPlaying: function(event) {
        console.log(this.typeId() + ".onPlaying() ", event)
        return this
    },

    createSourceElement: function() {
        const e = document.createElement("source")
        this.setSourceElement(e)
        return e
    },

    audioTypeForExtension: function(extString) {
        const fileExtensionToType = {
            "mp3": "mpeg",
            "wav": "wav",
            "mp4": "mp4",
            "mpa": "mp4",
            "ogg": "ogg",
            "oga": "ogg",
        }
        const type =  "audio/" + fileExtensionToType[extString.toLowerCase()]
        assert(type)
        return type
    },

    setPath: function(aPath) {
        if (this._path != aPath) {
            this._path = aPath
        
            this.stop()

            console.log(this.typeId() +  ".setPath:'" + aPath + "'")
        
            const source = this.sourceElement()
            source.src = aPath;

            const type = this.audioTypeForExtension(aPath.pathExtension());
            source.setAttribute("type", type);
            this.load() 
        }
        return this
    },

    path: function() {
        return this.sourceElement().getAttribute("src");
    },

    load: function() {
        console.log(this.typeId() +  ".load() '" + this.path() + "'")
        //setTimeout(() => { this.element().load() }, 10)
        this.element().load()

        return this
    },

    play: function() {
        if (this.isPlaying()) {
            return this
        }
        console.log(this.typeId() +  ".play() '" + this.path() + "'")

        const promise = this.element().play()
        promise.catch((e) => {
            console.log("audio play exception: ", e)
        })
        return this

    },

    stop: function() {
        console.log(this.typeId() +  ".stop() '" + this.path() + "'")
        const e = this.element()
        e.pause();
        e.currentTime = 0;
        return this
    },

    pause: function() {
        this.element().pause()
        return this
    },

    isPaused: function() {
        const e = this.element()
        return e.paused
    },

    isPlaying: function() {
        const e = this.element()
        return e.duration > 0 && !e.paused
    },

    currentTime: function() {
        return this.element().currentTime
    },

    playbackRate: function() {
        return this.element().playbackRate
    },

    setPlaybackRate: function(r) {
        this.element().playbackRate = r
        return this
    }

})
