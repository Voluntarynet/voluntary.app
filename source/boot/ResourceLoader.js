"use strict"

/*

    ResourceLoader

    A simple Javascript importing system.

    Several classes are in this one file to avoid JS loading synchronization issues.
	This runs _import.js which will then reference js and css files and
    _import.js file in it's subfolders.
    
	This makes source reorganizations easier and helps
	keep folder organization aligned with dependency organization
	
	Add an _imports.js file - here's an example. Notice you can reference css files as well.
	
	ResourceLoader.pushRelativePaths([
		"_css.css", 
		"external_libs/_imports.js",
		"resources/data/_imports.js",
		"source/_imports.js",
		"MyApp.js",
	])
	
	The paths in each _imports.js file are relative to the folder it is found within.

	If you need to call some initialization functions after everything is loaded, 
	you can call ResourceLoader.pushDoneCallback() in the related folder's _imports.js

		ResourceLoader.pushDoneCallback( () => {
			sjcl.random.startCollectors();
		})		

    Note: Should probably clean this up with promises.
    
*/

if (!String.prototype.capitalized) {
    String.prototype.capitalized = function () {
        return this.replace(/\b[a-z]/g, function (match) {
            return match.toUpperCase();
        });
    }
}

class ResourceLoaderBase {

    static shared() {
        if (!this._shared) {
            this._shared = this.clone()
        }
        return this._shared
    }

    type() {
        return this.constructor.name
    }

    static clone() {
        const obj = new this()
        obj.init()
        return obj
    }
    
    init() {
        // subclasses should override to initialize
    }

    newSlot(slotName, initialValue) {
        if (typeof(slotName) !== "string") {
            throw new Error("slot name must be a string"); 
        }

        if (initialValue === undefined) { 
            initialValue = null 
        };

        const privateName = "_" + slotName;
        this[privateName] = initialValue;

        if (!this[slotName]) {
            this[slotName] = function () {
                return this[privateName];
            }
        }

        const setterName = "set" + slotName.capitalized()

        if (!this[setterName]) {
            this[setterName] = function (newValue) {
                this[privateName] = newValue;
                return this;
            }
        }

        return this;
    }
}

// --- CSSLink ---------------------------------------------------

class CSSLink extends ResourceLoaderBase {
    init() {
        super.init()
        this.newSlot("fullPath", null);
        // subclasses should override to initialize
    }

    run () {
        const styles = document.createElement("link")
        styles.rel = "stylesheet"
        styles.type = "text/css"
        styles.media = "screen"
        styles.href = this.fullPath()
        document.getElementsByTagName("head")[0].appendChild(styles)
    }
}

// --- JSScript ---------------------------------------------------

class JSScript extends ResourceLoaderBase {
    init() {
        super.init()
        this.newSlot("importer", null);
        this.newSlot("fullPath", null);
        this.newSlot("doneCallback", null);
    }

    run () {
        const script = document.createElement("script")
        //console.log("JSScript loading: '" + this.fullPath() + "'")

        script.src = this.fullPath()

        script.onload = () => {
            //console.log("loaded script src:'" + script.src + "' type:'" + script.type + "' text:[[[" + script.text + "]]]")
            this._doneCallback()
        }

        script.onerror = (error) => {
            this.importer().setError(error)
            throw new Error("missing url " + this.fullPath())
        }

        const parent = document.getElementsByTagName("head")[0] || document.body
        parent.appendChild(script)
    }

    basePath () {
        const parts = this.fullPath().split("/")
        parts.pop()
        const basePath = parts.join("/")
        return basePath
    }
}

// --- ResourceLoader -----------------------------------------------

class ResourceLoaderClass extends ResourceLoaderBase {

    init() {
        super.init()
        this.newSlot("currentScript", null);
        this.newSlot("urls", []);
        this.newSlot("doneCallbacks", []),
        this.newSlot("urlLoadingCallbacks", []);
        this.newSlot("errorCallbacks", []);
        
        this.newSlot("jsFilesLoaded", []) // these may be embedded in index.html
        this.newSlot("cssFilesLoaded", [])  // these may be embedded in index.html

        //this.newSlot("archive", null)

        this.newSlot("resourceFilePaths", [])
        this._maxUrlCount = 0
    }

    resourceFilePathsWithExtensions(extensions) {
        return this.resourceFilePaths().select(path => extensions.contains(path.pathExtension().toLowerCase()))
    }

    currentScriptPath () {
        if (this.currentScript()) {
            return this.currentScript().basePath()
        }
        return ""
    }

    absolutePathForRelativePath (aPath) {
        const parts = this.currentScriptPath().split("/").concat(aPath.split("/"))
        let rPath = parts.join("/")

        if (rPath[0] === "/"[0]) {
            rPath = "." + rPath
        }

        return rPath
    }

    absolutePathsForRelativePaths (paths) {
        return paths.map((aPath) => { return this.absolutePathForRelativePath(aPath) })
    }

    pushRelativePaths (paths) {
        this.pushFilePaths(this.absolutePathsForRelativePaths(paths))
        return this
    }

    pushFilePaths (paths) {
        this.setUrls(paths.concat(this.urls()))
        this._maxUrlCount += paths.length
        return this
    }

    pushDoneCallback (aCallback) {
        this.doneCallbacks().push(aCallback)
        return this
    }

    pushUrlLoadingCallback (aCallback) {
        this.urlLoadingCallbacks().push(aCallback)
        return this
    }

    pushErrorCallback (aCallback) {
        this.errorCallbacks().push(aCallback)
        return this
    }

    removeErrorCallback (aCallback) {
        this.errorCallbacks().remove(aCallback)
        return this
    }

    removeUrlCallback (aCallback) {
        this.urlLoadingCallbacks().remove(aCallback)
        return this
    }

    // --- run ---

    run () {
        this.loadNext()
    }

    isDone () {
        return this.urls().length === 0
    }

    loadNext () {
        if (!this.isDone()) {
            const url = this.urls().shift()
            this.loadUrl(url)
        } else {
            this.done()
        }
        return this
    }

    loadUrl (url) {
        this.urlLoadingCallbacks().forEach(callback => callback(url, this._maxUrlCount))

        const extension = url.split(".").pop().toLowerCase()
        //const fontExtensions = ["ttf", "woff", "woff2"]
        //const audioExtensions = ["wav", "mp3", "m4a", "mp4", "oga", "ogg"]
        //const imageExtensions = ["png", "jpg", "jpeg", "gif", "tiff", "bmp"]

        if (extension === "js" || extension === "json") {
            this.jsFilesLoaded().push(url)
            const script = JSScript.clone().setImporter(this).setFullPath(url).setDoneCallback(() => { this.loadNext() })
            this.setCurrentScript(script)
            this.currentScript().run()
        } else if (extension === "css") {
            this.cssFilesLoaded().push(url)
            CSSLink.clone().setFullPath(url).run() // move to CSSResources?
            this.loadNext()
        } else {
            this.resourceFilePaths().push(url)
            this.loadNext()
        }

        /*
        } else if (fontExtensions.contains(extension)) {
            this.fontFilePaths().push(url)
            this.loadNext()
        } else if (audioExtensions.contains(extension)) {
            this.audioFilePaths().push(url)
            this.loadNext()
        } else if (imageExtensions.contains(extension)) {
            this.imageFilePaths().push(url)
            this.loadNext()
        } else {
            throw new Error("unrecognized extension on url '" + url + "'")
        }
        */

        return this
    }

    done () {
        //console.log("ResourceLoader.done() -----------------------------")
        this.doneCallbacks().forEach(callback => callback())
        return this
    }

    setError (error) {
        this.errorCallbacks().forEach(callback => callback(error))
        return this
    }
}

window.ResourceLoader = ResourceLoaderClass.shared()

if (window.ResourceLoaderIsEmbedded !== true) {
    ResourceLoader.pushRelativePaths(["_imports.js"]).run()
}
