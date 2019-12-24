"use strict"

/*

    ResourceLoaderPanel

    A full page panel that shows load progress.
  
    While running, displays app name, progress bar, and current loading file name.
    On error, displays an error description.
    Used with ResourceLoader.

    Automatically sets up in the document when loading this file via:

        window.ResourceLoaderPanel.startWhenReady()

    When all loading is finished, external code should call:

    		window.ResourceLoaderPanel.stop()  

    Notes:
    This code is a bit ugly because it doesn't have any library dependencies 
    as we need to show it before we load the libraries & need it to tell us about any loading errors.

*/


class ResourceLoaderPanelClass {

    type() {
        return this.constructor.name
    }

    static clone() {
        const obj = new this()
        obj.init()
        return obj
    }
    
    init() {
        this._error = null;
        this._loadCount = 0
    }
    
    // --- elements ------------------------------------------------

    mainElement () {
        return document.getElementById("SpinnerMain")
    }

    iconElement () {
        return document.getElementById("SpinnerIcon")
    }

    middleElement () {
        return document.getElementById("SpinnerMiddle")
    }

    titleElement () {
        return document.getElementById("SpinnerTitle")
    }

    barElement () {
        return document.getElementById("SpinnerBar")
    }

    itemElement () {
        return document.getElementById("SpinnerItem")
    }

    errorElement () {
        return document.getElementById("SpinnerError")
    }

    // --- start ------------------------------------------------

    canStart () {
        return window["ResourceLoader"] !== undefined
    }

    startWhenReady () {
        //console.log("ResourceLoaderPanel.startWhenReady()")
        if (this.canStart()) {
            this.start()
        } else {
            setTimeout(() => { this.startWhenReady() }, 100)
        }
    }

    start () {
        //console.log("ResourceLoaderPanel.start()")
        if (!ResourceLoaderClass.shared().isDone()) {
            this.setupHtml()
            this.initTitle()
            this.registerForWindowError()
            this.registerForImports()
        }

        if (ResourceLoaderClass.shared().isDone()) {
            //this.setupHtml()
            this.stop()
        }
        return this
    }

    setupHtml () {
        //console.log("ResourceLoaderPanel.setupHtml()")
        document.body.innerHTML = "<div id='SpinnerMain' style='position: absolute; width:100%; height: 100%; background-color: black; z-index: 100000; font-family: AppRegular, Sans-Serif; letter-spacing: 3px; font-size:13px;'> \
<div id='SpinnerMiddle' \
style='position: relative; top: 50%; transform: translateY(-50%); height: auto; width: 100%; text-align: center;'> \
<div>\
<div id='SpinnerIcon' style='opacity: 0.7; border: 0px dashed yellow; transition: all .6s ease-out; background-image:url(\"resources/icons/appicon.svg\"); background-position: center; background-repeat: no-repeat; height: 60px; width: 100%; background-size: contain;'></div><br> \
</div>\
<div id='SpinnerTitle' style='margin-top: 12px; transition: all .6s ease-out;'></div><br> \
<center><div style='margin-top: 12px; width:170px; height: 4px; border-radius:2px; background-color: #444; text-align: left;'><div id='SpinnerBar' style='height:4px; border-radius:2px; background-color:#bbb; transition: all 0s ease-out; letter-spacing: -2.5px;'></div><div></center><br> \
<div id='SpinnerItem' style='color: transparent; transition: all 0.3s ease-out;'></div><br> \
<div id='SpinnerError' style='color: red; transition: all .6s ease-out; text-align: center; width: 100%;'></div> \
</div> \
</div>"
        return this
    }

    initTitle () {
        const title = this.titleElement()
        title.style.color = "#aaa"
        //title.innerHTML = "LOADING"

        if (window.ResourceLoaderIsEmbedded) {
            this.hide()
        }

        return this
    }

    hide() {
        this.mainElement().style.visibility = "hidden"
        this.titleElement().style.visibility = "hidden"
    }

    show () {
        this.mainElement().style.visibility = "visible"
        this.titleElement().style.visibility = "visible"
    }

    // --- callabcks ------------------------------------------------

    registerForImports () {
        this._importerUrlCallback = (url, max) => { this.didImportUrl(url, max) }
        ResourceLoaderClass.shared().pushUrlLoadingCallback(this._importerUrlCallback)

        this._importerErrorCallback = (error) => { this.setError(error) }
        ResourceLoaderClass.shared().pushErrorCallback(this._importerErrorCallback)

        return this
    }

    unregisterForImports () {
        ResourceLoaderClass.shared().removeUrlCallback(this._importerUrlCallback)
        ResourceLoaderClass.shared().removeErrorCallback(this._importerErrorCallback)
        return this
    }

    didImportUrl (url, max) {
        this.setCurrentItem(url.split("/").pop())
        this.incrementItemCount(max)
        return this
    }

    handleError (errorMsg, url, lineNumber, column, errorObj) {
        if (!this.titleElement()) {
            console.warn("should be unregistered?")
            return false
        }

        //this.titleElement().innerHTML = "ERROR"
        let s = "" + errorMsg

        if (url) {
            s += " in " + url.split("/").pop() + " Line: " + lineNumber;  //+ " Column: "" + column;
        }

        /*
		if (errorObj) {
			s += '<br><br>' +  this.stringForError(errorObj).split("\n").join("<br>")
		}
		*/

        this.setError(s)
        return false;
    }

    registerForWindowError () {
        this._windowErrorCallback = (errorMsg, url, lineNumber, column, errorObj) => {
            return this.handleError(errorMsg, url, lineNumber, column, errorObj)
        }
        window.onerror = this._windowErrorCallback
    }

    unregisterForWindowError () {
        const isRegistered = window.onerror === this._windowErrorCallback
        if (isRegistered) {
            window.onerror = null
        }
    }

    maxFileCount () {
        if (!this._maxFileCount) {
            var s = localStorage.getItem(this.type() + ".maxFileCount");
            if (s) {
                this._maxFileCount = Number(s)
            } else {
                this._maxFileCount = 1
            }
        }
        return this._maxFileCount
    }

    setMaxFileCount (count) {
        this._maxFileCount = count
        localStorage.setItem(this.type() + ".maxFileCount", count);
        return this
    }

    incrementItemCount (max) {
        this._loadCount ++
        if (this._loadCount > this.maxFileCount()) {
            this.setMaxFileCount(this._loadCount)
        }

        const e = this.barElement()
        if (e) {
            let p = Math.floor(100 * this._loadCount / this.maxFileCount())
            if (p >= 100) {
                p = 100
                e.style.transition = "all 0.3s"
                e.style.backgroundColor = this._loadCount % 2 ? "#777" : "#ccc"
                e.style.width = this._loadCount % 2 ? "100%" : "95%"
            } else {
                e.style.width = p + "%"
            }
        }
        return this
    }

    setCurrentItem (itemName) {
        const item = this.itemElement()
        //item.style.opacity = 0
        item.style.color = "#444"
        //item.currentValue = itemName	
        //item.innerHTML = itemName // commented out to make cleaner 
        /*
    	//setTimeout(() => { 
    	    if (item.currentValue === item.innerHTML) {
    	        item.style.opacity = 1
	        }
    	//}, 0)
*/
        return this
    }

    setError (error) {
        this._error = error
        //console.trace()
        this.errorElement().innerHTML = error
        this.show()
        return this
    }

    error () {
        return this._error
    }

    removeMainElement () {
        const e = this.mainElement()
        if (e) {
            e.parentNode.removeChild(e)
        }
    }

    stop () {
        this.unregisterForWindowError()

        if (!this.error()) {
            this.removeMainElement()
            this.unregisterForImports()
            delete window[this.type()]
        }
        return this
    }
}

window.ResourceLoaderPanel = ResourceLoaderPanelClass.clone()
window.ResourceLoaderPanel.startWhenReady()

