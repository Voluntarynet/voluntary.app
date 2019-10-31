"use strict"

/*

    DocumentBody

*/

DomView.newSubclassNamed("DocumentBody").newSlots({
}).setSlots({
    init: function () {
        DomView.init.apply(this)

        /*
        window.SyncScheduler.shared().scheduleTargetAndMethod(this, "autoAdjustZoomForMobile")

        setTimeout(() => {
            this.setIsRegisteredForDocumentResize(true)
        })
        */

        // setup shared devices for later use
        Devices.shared().setupIfNeeded()
        return this
    },

    shared: function() {   
        return this.sharedInstanceForClass(DocumentBody)
    },
    
    setupElement: function() {
        document.body._domView = this
        //this._element = document.body
        // get this from element override
        return this
    },
    
    element: function() {
        return document.body
    },
    
    zoomAdjustedWidth: function() {
        return WebBrowserWindow.shared().width() * this.zoomRatio()
    },
    
    zoomAdjustedHeight: function() {
        return WebBrowserWindow.shared().width() * this.zoomRatio()
    },
    
    zoomAdjustedSize: function() { // TODO: move to Point
        return { width: this.zoomAdjustedWidth(), height: this.zoomAdjustedHeight() }
    },

    allDomElements: function() {
        const domElements = this.element().getElementsByTagName("*");
        return domElements
    },

    viewsUnderPoint: function(aPoint) {
        const elements = document.elementsFromPoint(aPoint.x(), aPoint.y())
        const views = elements.map(e => this.firstViewForElement(e)).nullsRemoved()
        return views
    },

    firstViewForElement: function(e) {
        // search up the dom element parents to find one
        // associated with a DomView instance 

        while (e) {
            const view = e._domView
            if (view) {
                return view
            }
            e = e.parentElement
        }

        return null
    },

    /*
    onDocumentResize: function() {
	     window.SyncScheduler.shared().scheduleTargetAndMethod(this, "autoAdjustZoomForMobile")
        //this.autoAdjustZoomForMobile()
    },
    
    autoAdjustZoomForMobile: function() {
        const w = WebBrowserScreen.shared().width();
        const h = WebBrowserScreen.shared().height();
        
        console.log("screen " + w + "x" + h)

        let z = "100%"
        
        if (w < 800) {
            z = "300%"
        }
        
        this.setZoom(z)
        
        //console.log("DocumentBody windowWidth: " + WebBrowserWindow.shared().width() + " zoom: " + this.zoom() )
        return this
    },
    */
})

