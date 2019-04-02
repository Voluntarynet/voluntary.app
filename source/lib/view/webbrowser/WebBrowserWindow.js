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

    dropCheck : function(event) {
        let element = event.target
        let elementMayWantDrop = element.ondrop
        let view = element._divView
        let viewMayWantDrop = view && view.dropListener().isListening()

        if (!elementMayWantDrop && !viewMayWantDrop) {
            event.preventDefault();
            event.dataTransfer.effectAllowed = "none";
            event.dataTransfer.dropEffect = "none";	
        }
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
    
    mobileNames: function() {
        return ["android", "webos", "iphone", "ipad", "ipod", "blackBerry", "windows phone"]  
    },

    agent: function() {
        return navigator.userAgent.toLowerCase()
    },

    vendor: function() {
        return navigator.vendor.toLowerCase()
    },

    agentIsSafari: function() {
        const vendor = navigator.vendor;
        const agent = navigator.userAgent;
        
        const isSafari = vendor && 
                vendor.indexOf("Apple") !== -1 &&
                agenta &&
                agent.indexOf("CriOS") === -1 &&
                agent.indexOf("FxiOS") === -1;
        return isSafari
    },

    agentIsChrome: function() {
        const isChrome =  Boolean(window.chrome) //&& 
        //navigator.userAgent.indexOf('Brave') === -1;
        //console.log("window.chrome = ", window.chrome);
        return isChrome
    },
    
    isOnMobile: function() { 
        const agent = this.agent();
        const match = this.mobileNames().detect((name) => { return agent.contains(name); })
        return match !== null
    },

    isTouchDevice: function() {
        // via https://stackoverflow.com/questions/4817029/whats-the-best-way-to-detect-a-touch-screen-device-using-javascript
        let result = false 
        if ("ontouchstart" in window) { result = true; }        // works on most browsers 
        if (navigator.maxTouchPoints) { result = true; }       // works on IE10/11 and Surface	
        //console.log("WebBrowserWindow.isTouchDevice() = ", result)
        return result
    },

    urlHash: function() {
        return decodeURI(window.location.hash.substr(1)) // return string after # character
    },
    
    setUrlHash: function(aString) {
        if (this.urlHash() !== aString) {
            window.location.hash = encodeURI(aString)
        }
        return this
    },
    
    descriptionDict: function() {
        const dict = {
            agent: this.agent(),
            size: this.width() + "x" + this.height(),
            isOnMobile: this.isOnMobile()
        }
        return dict
    },

    urlHostname: function() {
        const parser = document.createElement("a")
        parser.href = window.location.href
        let name = parser.hostname
        if (!name) {
		    name = ""
        }
        return name
    },
	
    setTitle: function(aName) {
        document.title = aName
        return this
    },

    title: function() {
        return document.title
    },
    
    activeDivView: function() {
        const e = document.activeElement
        if (e && e._divView) {
            return e._divView
        }
        return null
    },
})

/*
console.log("navigator.userAgent = ", navigator.userAgent);
console.log("window.WebBrowserWindow.agentIsSafari() = ", window.WebBrowserWindow.agentIsSafari())
console.log("window.WebBrowserWindow.agentIsChrome() = ", window.WebBrowserWindow.agentIsChrome())
*/

WebBrowserWindow.shared().setup()