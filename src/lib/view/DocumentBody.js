
DocumentBody = DivView.extend().newSlots({
    type: "DocumentBody",
}).setSlots({
    init: function () {
        DivView.init.apply(this)
        this.setIsRegisterForWindowResize(true)
        setTimeout(() => { this.autoAdjustZoomForMobile() })
        return this
    },
    
    setupElement: function() {
        // get this from element override
    },
    
    element: function() {
        return document.body
    },
    
    onWindowResize: function() {
        this.autoAdjustZoomForMobile()
    },
    
    autoAdjustZoomForMobile: function() {
        var z = "100%"
        
        if (Window.width() < 1000) {
            z = "300%"
        }
        
        /*
        if (Window.width() < 600) {
            z = "200%"
        }
        
        if (Window.width() < 400) {
            z = "150%"
        }
        */
        
        this.setZoom(z)
        
        //console.log("DocumentBody windowWidth: " + Window.width() + " zoom: " + this.zoom() )
        return this
    },
    
    zoomAdjustedWidth: function() {
        return Window.width() * this.zoomRatio()
    },
    
    zoomAdjustedHeight: function() {
        return Window.width() * this.zoomRatio()
    },
    
    zoomAdjustedSize: function() {
        return { width: this.zoomAdjustedWidth(), height: this.zoomAdjustedHeight() }
    },
})