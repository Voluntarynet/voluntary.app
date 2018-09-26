"use strict"

window.DocumentBody = DivView.extend().newSlots({
    type: "DocumentBody",
}).setSlots({
    init: function () {
        DivView.init.apply(this)
        this.setIsRegisterForWindowResize(true)
        window.SyncScheduler.shared().scheduleTargetAndMethod(this, "autoAdjustZoomForMobile")

        // using event intercept phase to grab all events and record them
        // in Mouse.shared() and Keyboard.shared() objects
        this.setIsRegisteredForKeyboard(true, true)
        this.setIsRegisteredForMouse(true, true)
        return this
    },
    
    setupElement: function() {
        // get this from element override
    },
    
    element: function() {
        return document.body
    },
    
    onWindowResize: function() {
	     window.SyncScheduler.shared().scheduleTargetAndMethod(this, "autoAdjustZoomForMobile")
        //this.autoAdjustZoomForMobile()
    },
    
    autoAdjustZoomForMobile: function() {
        /*
        var w = WebBrowserScreen.shared().width();
        var h = WebBrowserScreen.shared().height();
        
        console.log("screen " + w + "x" + h)

        var z = "100%"
        
        if (w < 800) {
            z = "300%"
        }

        
        this.setZoom(z)
        
        //console.log("DocumentBody windowWidth: " + WebBrowserWindow.shared().width() + " zoom: " + this.zoom() )
        */
        return this
    },
    
    zoomAdjustedWidth: function() {
        return WebBrowserWindow.shared().width() * this.zoomRatio()
    },
    
    zoomAdjustedHeight: function() {
        return WebBrowserWindow.shared().width() * this.zoomRatio()
    },
    
    zoomAdjustedSize: function() {
        return { width: this.zoomAdjustedWidth(), height: this.zoomAdjustedHeight() }
    },

    // --- event intercept keyboard ---

    onKeyDown: function (event) {
        return window.Keyboard.shared().onKeyDown(event)
    },

    onKeyUp: function (event) {
        console.log(this.type() + " onKeyUp ")
        return window.Keyboard.shared().onKeyUp(event)
    },

    // --- event intercept mouse ---

    onMouseDown: function(event) {
        console.log("DocumentBody onMouseDown")
        return window.Mouse.shared().onMouseDown(event)
    },

    onMouseMove: function (event) {
        return window.Mouse.shared().onMouseMove(event)
    },

    onMouseUp: function(event) {
        return window.Mouse.shared().onMouseUp(event)
    },  

})

