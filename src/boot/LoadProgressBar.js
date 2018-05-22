"use strict"

/*
    A full page panel that shows load progress.
    While running, displays app name, progress bar, and current loading file name.
    On error, displays an error description.
    Used with JSImporter.

    Automatically sets up in the document when loading this file via:

        window.LoadProgressBar.startWhenReady()

    When all loading is finished, external code should call:

    		window.LoadProgressBar.stop()  

*/

window.LoadProgressBar = {
    type: function () { return "LoadProgressBar" },
    _error: null,

    // --- elements ------------------------------------------------

    mainElement: function () {
        return document.getElementById("SpinnerMain")
    },

    iconElement: function () {
        return document.getElementById("SpinnerIcon")
    },

    middleElement: function () {
        return document.getElementById("SpinnerMiddle")
    },


    titleElement: function () {
        return document.getElementById("SpinnerTitle")
    },

    subtitleElement: function () {
        return document.getElementById("SpinnerSubtitle")
    },

    itemElement: function () {
        return document.getElementById("SpinnerItem")
    },

    errorElement: function () {
        return document.getElementById("SpinnerError")
    },

    // --- start ------------------------------------------------

    canStart: function () {
        return window["JSImporter"] != null
    },

    startWhenReady: function () {
        if (this.canStart()) {
            this.start()
        } else {
            setTimeout(() => { this.startWhenReady() }, 100)
        }
    },

    start: function () {
        if (!JSImporter.isDone()) {
            this.setupHtml()
            this.initTitle()
            this.registerForWindowError()
            this.registerForImports()
        }

        if (JSImporter.isDone()) {
            this.stop()
        }
        return this
    },

    setupHtml: function () {
        document.body.innerHTML = "<div id='SpinnerMain' style='position: absolute; width:100%; height: 100%; background-color: black; z-index: 100000; font-family: AppRegular; letter-spacing: 3px; font-size:13px;'> \
<div id='SpinnerMiddle' \
style='position: relative; top: 50%; transform: translateY(-50%); height: auto; width: 100%; text-align: center;'> \
<div>\
<div id='SpinnerIcon' style='opacity: 0.7; border: 0px dashed yellow; transition: all .6s ease-out; background-image:url(\"icons/appicon.svg\"); background-position: center; background-repeat: no-repeat; height: 60px; width: 100%; background-size: contain;'></div><br> \
</div>\
<div id='SpinnerTitle' style='transition: all .6s ease-out;'></div><br> \
<div id='SpinnerSubtitle' style='transition: all .3s ease-out; letter-spacing: -2.5px;'></div><br> \
<div id='SpinnerItem' style='color: transparent; transition: all 0.3s ease-out;'></div><br> \
<div id='SpinnerError' style='color: red; transition: all .6s ease-out; text-align: center; width: 100%;'></div> \
</div> \
</div>"

	    /*
	    var style = this.middleElement().style
	    style.position = "relative"
        style.top = "50%"
        style.transform = "translateY(-50%)"
        style.height = "auto"
        style.width = "100%"
        style.fontFamily = "AppRegular"
        style.letterSpacing = "3px"
        style.color = "transparent"
        style.textAlign = "center"
        */

        return this
    },

    initTitle: function () {
        var title = this.titleElement()
        title.style.color = "#aaa"
        title.innerHTML = "PEER LOADING"
        return this
    },

    // --- callabcks ------------------------------------------------

    registerForImports: function () {
        this._importerUrlCallback = (url) => { this.didImportUrl(url) }
        JSImporter.pushUrlLoadingCallback(this._importerUrlCallback)

        this._importerErrorCallback = (error) => { this.setError(error) }
        JSImporter.pushErrorCallback(this._importerErrorCallback)

        return this
    },

    unregisterForImports: function () {
        JSImporter.removeUrlCallback(this._importerUrlCallback)
        JSImporter.removeErrorCallback(this._importerErrorCallback)
        return this
    },

    didImportUrl: function (url) {
        this.incrementItemCount()
        this.setCurrentItem(url.split("/").pop())
        return this
    },

    handleError: function (errorMsg, url, lineNumber, column, errorObj) {
        if (!this.titleElement()) {
            console.warn("should be unregistered?")
            return false
        }

        this.titleElement().innerHTML = "ERROR"
        var s = "" + errorMsg

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
    },

    registerForWindowError: function () {
        this._windowErrorCallback = (errorMsg, url, lineNumber, column, errorObj) => {
            return this.handleError(errorMsg, url, lineNumber, column, errorObj)
        }
        window.onerror = this._windowErrorCallback
    },

    unregisterForWindowError: function () {
        var isRegistered = window.onerror === this._windowErrorCallback
        if (isRegistered) {
            window.onerror = null
        }
    },

    /*
    isPresent: function() {
        return this.mainElement() != null
    },
    */

    incrementItemCount: function () {
        var subtitle = this.subtitleElement()
        if (subtitle) {
            subtitle.style.color = "#666"
            subtitle.innerHTML += "."
        }
        return this
    },

    setCurrentItem: function (itemName) {
        var item = this.itemElement()
        //item.style.opacity = 0
        item.style.color = "#444"
        //item.currentValue = itemName	
        item.innerHTML = itemName
        /*
    	//setTimeout(() => { 
    	    if (item.currentValue == item.innerHTML) {
    	        item.style.opacity = 1
	        }
    	//}, 0)
*/
        return this
    },

    setError: function (error) {
        this._error = error
        console.log("LoadProgressBar setError " + error)
        this.errorElement().innerHTML = error
        return this
    },

    error: function () {
        return this._error
    },

    removeMainElement: function () {
        var e = this.mainElement()
        if (e) {
            e.parentNode.removeChild(e)
        }
    },

    stop: function () {
        this.unregisterForWindowError()

        if (!this.error()) {
            this.removeMainElement()
            this.unregisterForImports()
            delete window[this.type()]
        }
        return this
    },
}

window.LoadProgressBar.startWhenReady()
