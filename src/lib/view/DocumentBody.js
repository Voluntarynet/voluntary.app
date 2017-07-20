
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
        this._element = document.body
    },
    
    onWindowResize: function() {
        this.autoAdjustZoomForMobile()
    },
    
    autoAdjustZoomForMobile: function() {
        var z = "100%"
        
        if (Window.width() < 1000) {
            z = "300%"
        }
        
        this.setZoom(z)
        
        //console.log("DocumentBody windowWidth: " + Window.width() + " zoom: " + this.zoom() )
        return this
    },
})