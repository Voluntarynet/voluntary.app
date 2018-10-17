"use strict"

/*

    WebBrowserWindow

    Abstraction for the main web browser window. 
    Owns a DocumentBody view.

*/

window.WebBrowserWindow = ideal.Proto.extend().newSlots({
    type: "WebBrowserWindow",
    /*documentBody: DocumentBody.shared(),*/
}).setSlots({
    init: function () {
        throw new Error("this class is meant to be used as singleton, for now")
        return this
    },

    documentBody: function() {
        return DocumentBody.shared()
    },
    
    shared: function() {
        return this
    },

    setup: function() {
        this.preventDrop()
    },
    
    /*  
    electronWindow: function() {
        if (!this._electronWindow) {
            const remote = require("electron").remote;
            this._electronWindow = remote.getCurrentWindow()
        }
        return this._electronWindow
    },
    */

    // prevent window level drop and only allow drop on elements that can handle it

    dropCheck : function(e) {
        // stopEventIfNotDroppable
		
        if (e.target.ondrop == null) {
            e.preventDefault();
            e.dataTransfer.effectAllowed = "none";
            e.dataTransfer.dropEffect = "none";	
        }
		
        return this
    },

    preventDrop: function() {
        window.addEventListener("dragenter", (e) => { this.dropCheck(e) }, false);
        window.addEventListener("dragover",  (e) => { this.dropCheck(e) }, false);
        window.addEventListener("drop",      (e) => { this.dropCheck(e) }, false);
        return this
    },
	
    // attributes
    
    width: function () {
        return window.innerWidth
    },

    height: function () {
        return window.innerHeight
    },
    
    aspectRatio: function() {
        return this.width() / this.height()
    },
    
    setWidth: function (w) {
        console.warn("warning: WebBrowserWindow.setWidth() unavailable in browser")
        return this
    },
    
    setHeight: function (h) {
        console.warn("warning: WebBrowserWindow.setHeight() unavailable in browser")
        return this
    },
    
    show: function() {
        console.log("Window size " + this.width() + "x" + this.height())
    },

    /*
    isOnPhone: function()
    {
       var userAgent = navigator.userAgent.toLowerCase()
       console.log("userAgent: '" + userAgent + "'")
    },
    */
    
    mobileNames: function() {
        return ["android", "webos", "iphone", "ipad", "ipod", "blackBerry", "windows phone"]  
    },

    agent: function() {
        var agent = navigator.userAgent.toLowerCase()
        return agent
    },

    agentIsSafari: function() {
        var isSafari = navigator.vendor && navigator.vendor.indexOf('Apple') > -1 &&
               navigator.userAgent &&
               navigator.userAgent.indexOf('CriOS') == -1 &&
               navigator.userAgent.indexOf('FxiOS') == -1;
        return isSafari
    },

    agentIsChrome: function() {
        var isChrome =  Boolean(window.chrome) //&& 
        //navigator.userAgent.indexOf('Brave') == -1;
        //console.log("window.chrome = ", window.chrome);
        return isChrome
    },
    
    isOnMobile: function() { 
        var agent = this.agent();
        var match = this.mobileNames().detect((name) => { return agent.contains(name); })
        return !(match === null)
    },

    isTouchDevice: function() {
        // via https://stackoverflow.com/questions/4817029/whats-the-best-way-to-detect-a-touch-screen-device-using-javascript
        var result = "ontouchstart" in window        // works on most browsers 
			|| navigator.maxTouchPoints;       // works on IE10/11 and Surface	
        if (result === 0) { result = false; }		
        //console.log("WebBrowserWindow.isTouchDevice() = ", result)
        return result
    },

    urlHash: function() {
        return decodeURI(window.location.hash.substr(1)) // return string after # character
    },
    
    setUrlHash: function(aString) {
        if (this.urlHash() != aString) {
            window.location.hash = encodeURI(aString)
        }
        return this
    },
    
    descriptionDict: function() {
        var dict = {
            agent: this.agent(),
            size: this.width() + "x" + this.height(),
            isOnMobile: this.isOnMobile()
        }
        return dict
    },

    urlHostname: function() {
        var parser = document.createElement("a")
        parser.href = window.location.href
        var name = parser.hostname
        if (!name) {
		    name = ""
        }
        return name
    },
	
    setTitle: function(aName) {
        document.title = aName
        return this
    },
    
    activeDivView: function() {
        var e = document.activeElement
        if (e && e._divView) {
            return e._divView
        }
        return null
    },

    /*
    debugFocus: function() {
        var focusFunc = (event) => { 
            var e = event.srcElement
            var name = e._divView ? e._divView.typeId() : (e.id ? e.id : e)
            console.log(">>>>>>>>>>>> Window focused element ", name) 
        }
        //var blurFunc = (e) => { console.log("window blurred element ", e._divView ? e._divView.typeId() : e)}
        
        window.addEventListener ? window.addEventListener("focus", focusFunc, true) : window.attachEvent("onfocusout", focusFunc);  
        //window.addEventListener ? window.addEventListener("blur', blurFunc, true) : window.attachEvent("onblur", blurFunc);
        return this
    },
    */
})

/*
console.log("navigator.userAgent = ", navigator.userAgent);
console.log("window.WebBrowserWindow.agentIsSafari() = ", window.WebBrowserWindow.agentIsSafari())
console.log("window.WebBrowserWindow.agentIsChrome() = ", window.WebBrowserWindow.agentIsChrome())
*/

WebBrowserWindow.shared().setup()