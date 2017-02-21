
/*
Window = ideal.Proto.extend().newSlots({
    type: "Window",
    win: null,
}).setSlots({
    init: function () {
        throw "this class is meant to be used as singleton, for now"
        return this
    },
    
    win: function() {
        if (!this._win) {
            const remote = require('electron').remote;
            this._win = remote.getCurrentWindow()
        }
        return this._win
    },
    
    width: function () {
        return this.win().getContentSize()[0]
    },

    height: function () {
        return this.win().getContentSize()[1]
    },
    
    setWidth: function (w) {
        this.win().setContentSize(w, this.height(), false)
    },
    
    setHeight: function (h) {
        this.win().setContentSize(this.width(), h, false)
    },
})
*/

WebBrowserWindow = ideal.Proto.extend().newSlots({
    type: "WebBrowserWindow",
    win: null,
}).setSlots({
    init: function () {
        throw "this class is meant to be used as singleton, for now"
        return this
    },
    
    win: function() {
        if (!this._win) {
            const remote = require('electron').remote;
            this._win = remote.getCurrentWindow()
        }
        return this._win
    },
    
    width: function () {
        return window.innerWidth
    },

    height: function () {
        return window.innerHeight
    },
    
    setWidth: function (w) {
        //console.log("warning: Window.setWidth() unavailable in browser")
    },
    
    setHeight: function (h) {
        //console.log("warning: Window.setHeight() unavailable in browser")
    },
})


Window = WebBrowserWindow

