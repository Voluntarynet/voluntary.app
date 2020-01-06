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

window.BMAudioPlayer = class BMAudioPlayer extends DomView {
    
    initPrototype () {
        this.newSlot("path", "")
        this.newSlot("sourceElement", null)
    }

    init () {
        this.setElementType("audio") // TODO: use a method override instead?
        super.init()
        this.open()
        return this
    }

    // open / close

    open () {
        this.setVisibility("hidden");
        DocumentBody.shared().addSubviewIfAbsent(this)
        return this
    }

    close () {
        DocumentBody.shared().removeSubviewIfPresent(this)
        return this
    }

    // element

    createElement () {
        const audio = document.createElement("audio")
        audio.setAttribute("autoplay", "");

        const source = document.createElement("source")
        this.setSourceElement(source)

        audio.appendChild(source)
        audio.addEventListener("playing", event => this.onPlaying(event), false); 
        return audio
    }

    onPlaying () {
        if (this.isDebugging()) {
            this.debugLog(".onPlaying() ")
        }
        return this
    }

    // path

    audioTypeForExtension (extString) {
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
    }

    setPath (aPath) {
        if (this._path != aPath) {
            this._path = aPath
        
            this.stop()

            if (this.isDebugging()) {
                this.debugLog( ".setPath:'" + aPath + "'")
            }

            const source = this.sourceElement()
            source.src = aPath;

            const type = this.audioTypeForExtension(aPath.pathExtension());
            source.setAttribute("type", type);
            this.load() 
        }
        return this
    }

    path () {
        return this.sourceElement().getAttribute("src");
    }

    name () {
        if (!this.path()) {
            return ""
        }
        return this.path().fileName()
    }

    // loading

    load () {
        if (this.isDebugging()) {
            this.debugLog( ".load() '" + this.path() + "'")
        }
        this.element().load()
        return this
    }

    // playing / pausing / stopping

    play () {
        if (this.isPlaying()) {
            return this
        }

        if (this.isDebugging()) {
            this.debugLog( ".play() '" + this.path() + "'")
        }

        const promise = this.element().play()
        promise.catch((e) => {
            console.log("audio play exception: ", e.message)
        })
        return this

    }

    isPlaying () {
        const e = this.element()
        return e.duration > 0 && !e.paused
    }

    // pausing

    pause () {
        this.element().pause()
        return this
    }

    isPaused () {
        const e = this.element()
        return e.paused
    }

    // stopping

    stop () {
        if (this.isDebugging()) {
            this.debugLog( ".stop() '" + this.path() + "'")
        }

        this.pause();
        this.setCurrentTime(0);
        return this
    }

    // current time

    setCurrentTime (t) {
        this.element().currentTime = t;
        return this;
    }

    currentTime () {
        return this.element().currentTime;
    }

    // playback rate

    playbackRate () {
        return this.element().playbackRate;
    }

    setPlaybackRate (r) {
        this.element().playbackRate = r;
        return this;
    }

}.initThisClass()
