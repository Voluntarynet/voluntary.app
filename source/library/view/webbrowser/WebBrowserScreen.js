"use strict"

/*

    WebBrowserScreen

*/

ideal.Proto.newSubclassNamed("WebBrowserScreen").newSlots({
}).setSlots({
    init: function () {
        throw new Error("this class is meant to be used as singleton, for now")
        ideal.Proto.init.apply(this)
        return this
    },

    shared: function() {
        return this
    },
    
    width: function () {
        return screen.width
    },

    height: function () {
        return screen.height
    },
    
    aspectRatio: function() {
        return this.width() / this.height()
    },
    
    isRotated: function() { // screen aspect doesn't match window (only works on mobile)
        const a = this.aspectRatio() > 1 
        const b = WebBrowserWindow.shared().aspectRatio() > 1
        return a !== b && WebBrowserWindow.shared().isOnMobile()
    },
    
    orientedWidth: function() {
        return this.isRotated() ? this.height() : this.width()
    },
    
    orientedHeight: function() {
        return this.isRotated() ? this.width() : this.height()
    },
        
    show: function() {
        this.debugLog(" size " + this.width() + "x" + this.height())
    },

    lesserOrientedSize: function() {
        // lesser of window and oriented screen size
        const w = Math.min(this.orientedWidth(), WebBrowserWindow.shared().width())
        const h = Math.min(this.orientedHeight(), WebBrowserWindow.shared().height())
        return { width: w, height: h }
    },

    userPrefersDarkMode: function() {
        // should we add a timer to monitor this value and post notifications on changes?
        // how about an NoteMonitor object that does this? example:
        // const m = NoteMonitor.clone().setTarget(this).setMethod("userPrefersDarkMode")
        // m.setName("didChangeDarkMode").setPeriodInSeconds(1).start()
        const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
        return prefersDark
    },

})

