"use strict"

/*

    JSImporter

    A simple Javascript importing system.

    Several classes are in this one file to avoid JS loading synchronization issues. TODO: move to import?
	This runs _import.js which will then reference js and css files and
    _import.js file in it's subfolders.
    
	This makes source reorganizations easier and helps
	keep folder organization aligned with dependency organization
	
	Add an _imports.js file - here's an example. Notice you can reference css files as well.
	
	JSImporter.pushRelativePaths([
		"_css.css", 
		"external_libs/_imports.js",
		"data/_imports.js",
		"src/_imports.js",
		"MyApp.js",
	])
	
	The paths in each _imports.js file are relative to the folder it is found within.

	If you need to call some initialization functions after everything is loaded, 
	you can call JSImporter.pushDoneCallback() in the related folder's _imports.js

		JSImporter.pushDoneCallback( () => {
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

class JSImporterBase {

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
        let obj = new this()
        obj.init()
        return obj
    }
    
    init() {
        // subclasses should override to initialize
    }

    newSlot(slotName, initialValue) {
        if (typeof (slotName) != "string") {
            throw new Error("slot name must be a string"); 
        }

        if (initialValue === undefined) { 
            initialValue = null 
        };

        let privateName = "_" + slotName;
        this[privateName] = initialValue;

        if (!this[slotName]) {
            this[slotName] = function () {
                return this[privateName];
            }
        }

        let setterName = "set" + slotName.capitalized()

        if (!this[setterName]) {
            this[setterName] = function (newValue) {
                this[privateName] = newValue;
                //this.updateSlot(slotName, privateName, newValue);
                return this;
            }
        }

        return this;
    }
}

// --- CSSLink ---------------------------------------------------

class CSSLink extends JSImporterBase {
    init() {
        super.init()
        this.newSlot("fullPath", null);
        // subclasses should override to initialize
    }

    run () {
        let styles = document.createElement("link")
        styles.rel = "stylesheet"
        styles.type = "text/css"
        styles.media = "screen"
        styles.href = this.fullPath()
        document.getElementsByTagName("head")[0].appendChild(styles)
    }
}

// --- JSScript ---------------------------------------------------

class JSScript extends JSImporterBase {
    init() {
        super.init()
        this.newSlot("importer", null);
        this.newSlot("fullPath", null);
        this.newSlot("doneCallback", null);
    }

    run () {
        let script = document.createElement("script")

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

        let parent = document.getElementsByTagName("head")[0] || document.body
        parent.appendChild(script)
    }

    basePath () {
        let parts = this.fullPath().split("/")
        parts.pop()
        let basePath = parts.join("/")
        return basePath
    }
}

// --- JSImporter -----------------------------------------------

class JSImporterClass extends JSImporterBase {

    init() {
        super.init()
        this.newSlot("currentScript", null);
        this.newSlot("urls", []);
        this.newSlot("doneCallbacks", []),
        this.newSlot("urlLoadingCallbacks", []);
        this.newSlot("errorCallbacks", []);
        this.newSlot("jsFilesLoaded", [])
        this.newSlot("cssFilesLoaded", [])
        this.newSlot("archive", null)
    }

    currentScriptPath () {
        if (this.currentScript()) {
            return this.currentScript().basePath()
        }
        return ""
    }

    absolutePathForRelativePath (aPath) {
        let parts = this.currentScriptPath().split("/").concat(aPath.split("/"))
        let rPath = parts.join("/")

        if (rPath[0] == "/"[0]) {
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
            let url = this.urls().shift()
            this.loadUrl(url)
        } else {
            this.done()
        }
        return this
    }

    loadUrl (url) {
        this.urlLoadingCallbacks().forEach(callback => callback(url))

        let extension = url.split(".").pop()

        if (extension == "js" || extension == "json") {
            this.jsFilesLoaded().push(url)
            this.setCurrentScript(JSScript.clone().setImporter(this).setFullPath(url).setDoneCallback(() => { this.loadNext() }))
            //console.log("this.currentScript() = ", this.currentScript())
            this.currentScript().run()
        } else if (extension == "css") {
            this.cssFilesLoaded().push(url)
            CSSLink.clone().setFullPath(url).run()
            this.loadNext()
        } else {
            throw new Error("unrecognized extension on url '" + url + "'")
        }

        return this
    }

    done () {
        //console.log("JSImporter.done() -----------------------------")
        this.doneCallbacks().forEach(callback => callback())
        return this
    }

    setError (error) {
        this.errorCallbacks().forEach(callback => callback(error))
        return this
    }
}

window.JSImporter = JSImporterClass.shared()

if (window.JSImporterIsEmbedded != true) {
    JSImporter.pushRelativePaths(["_imports.js"]).run()
}

