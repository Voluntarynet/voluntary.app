"use strict"

window.DocumentBody = DivView.extend().newSlots({
    type: "DocumentBody",
}).setSlots({
    init: function () {
        DivView.init.apply(this)
        this.setIsRegisterForWindowResize(true)
	    window.SyncScheduler.shared().scheduleTargetAndMethod(this, "autoAdjustZoomForMobile")
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
})

