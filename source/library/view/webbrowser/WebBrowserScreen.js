"use strict"

/*

    WebBrowserScreen

*/

window.WebBrowserScreen = class WebBrowserScreen extends ProtoClass {
    
    initPrototype () {

    }

    init () {
        assert(!this.thisClass().hasShared()) // enforce singleton
        super.init()
    }

    width () {
        return screen.width
    }

    height () {
        return screen.height
    }
    
    aspectRatio () {
        return this.width() / this.height()
    }
    
    isRotated () { // screen aspect doesn't match window (only works on mobile)
        const a = this.aspectRatio() > 1 
        const b = WebBrowserWindow.shared().aspectRatio() > 1
        return a !== b && WebBrowserWindow.shared().isOnMobile()
    }
    
    orientedWidth () {
        return this.isRotated() ? this.height() : this.width()
    }
    
    orientedHeight () {
        return this.isRotated() ? this.width() : this.height()
    }
        
    show () {
        this.debugLog(" size " + this.width() + "x" + this.height())
    }

    lesserOrientedSize () {
        // lesser of window and oriented screen size
        const w = Math.min(this.orientedWidth(), WebBrowserWindow.shared().width())
        const h = Math.min(this.orientedHeight(), WebBrowserWindow.shared().height())
        return { width: w, height: h }
    }

    userPrefersDarkMode () {
        // should we add a timer to monitor this value and post notifications on changes?
        // how about an NoteMonitor object that does this? example:
        // const m = NoteMonitor.clone().setTarget(this).setMethod("userPrefersDarkMode")
        // m.setName("didChangeDarkMode").setPeriodInSeconds(1).start()
        const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
        return prefersDark
    }

}.initThisClass()

