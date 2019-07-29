"use strict"


/*

    BMAudioPlayer

    Adds a body element like this:

        <audio id="audio" autoplay>
            <source id="audioSource" src="sounds/test.mp3" type="audio/mpeg"/ >
        </audio>

    Example use:

        const audioPlayer = BMAudioPlayer.shared().setPath(urlToAudioFile)
        audioPlayer.play()
        ...
        audioPlayer.stop()

*/

DomView.newSubclassNamed("BMAudioPlayer").newSlots({
    path: "",
    sourceElement: null,
    isDebugging: false,
}).setSlots({

    shared: function() {   
        const shared = this.sharedInstanceForClass(BMAudioPlayer)
        shared.open()
        return shared
    },

    init: function () {
        this.setElementType("audio") // TODO: use a method override instead?
        DomView.init.apply(this)
        return this
    },

    // open / close

    open: function() {
        this.setVisibility("hidden");
        DocumentBody.shared().addSubviewIfAbsent(this)
        return this
    },

    close: function() {
        DocumentBody.shared().removeSubviewIfPresent(this)
        return this
    },

    // element

    createElement: function() {
        const audio = document.createElement("audio")
        audio.setAttribute("autoplay", "");

        const source = document.createElement("source")
        this.setSourceElement(source)

        audio.appendChild(source)
        audio.addEventListener("playing", event => this.onPlaying(event), false); 
        return audio
    },

    onPlaying: function() {
        if (this.isDebugging()) {
            console.log(this.typeId() + ".onPlaying() ")
        }
        return this
    },

    // path

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

            if (this.isDebugging()) {
                console.log(this.typeId() +  ".setPath:'" + aPath + "'")
            }

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

    name: function() {
        if (!this.path()) {
            return ""
        }
        return this.path().fileName()
    },

    // loading

    load: function() {
        if (this.isDebugging()) {
            console.log(this.typeId() +  ".load() '" + this.path() + "'")
        }
        this.element().load()
        return this
    },

    // playing / pausing / stopping

    play: function() {
        if (this.isPlaying()) {
            return this
        }

        if (this.isDebugging()) {
            console.log(this.typeId() +  ".play() '" + this.path() + "'")
        }

        const promise = this.element().play()
        promise.catch((e) => {
            console.log("audio play exception: ", e.message)
        })
        return this

    },

    isPlaying: function() {
        const e = this.element()
        return e.duration > 0 && !e.paused
    },

    // pausing

    pause: function() {
        this.element().pause()
        return this
    },

    isPaused: function() {
        const e = this.element()
        return e.paused
    },

    // stopping

    stop: function() {
        if (this.isDebugging()) {
            console.log(this.typeId() +  ".stop() '" + this.path() + "'")
        }

        this.pause();
        this.setCurrentTime(0);
        return this
    },

    // current time

    setCurrentTime: function(t) {
        this.element().currentTime = t;
        return this;
    },

    currentTime: function() {
        return this.element().currentTime;
    },

    // playback rate

    playbackRate: function() {
        return this.element().playbackRate;
    },

    setPlaybackRate: function(r) {
        this.element().playbackRate = r;
        return this;
    }

})
