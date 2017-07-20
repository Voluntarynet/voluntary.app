
DocumentBody = DivView.extend().newSlots({
    type: "DocumentBody",
}).setSlots({
    init: function () {
        DivView.init.apply(this)
        this.setIsRegisterForWindowResize(true)
        this.autoAdjustZoomForMobile()
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
        
        if (this.width() < 1000) {
            document.body.style.zoom = "300%"
        }
        
        this.setZoom(z)
        console.log("set zoom: ", this.zoom() )
    },
})