"use strict"

/*
    DocumentListener

    Listens to a set of document related events.

*/

window.DocumentListener = EventSetListener.extend().newSlots({
    type: "DocumentListener",
}).setSlots({
    init: function () {
        EventSetListener.init.apply(this)

        this.addEventNameAndMethodName("resize", "onDocumentResize");

        // not sure how to organize these other events yet

        //this.addEventNameAndMethodName("pagehide", "onPageHide");
        //this.addEventNameAndMethodName("pageshow", "onPageShow");

        //this.addEventNameAndMethodName("submit", "onSumit");

        //this.addEventNameAndMethodName("online", "onBrowserOnline");
        //this.addEventNameAndMethodName("offline", "onBrowserOffline");

        //this.addEventNameAndMethodName("error", "onBrowserResourceLoadError");

        //this.addEventNameAndMethodName("fullscreenchange", "onBrowserFullScreenChange");
        //this.addEventNameAndMethodName("fullscreenerror", "onBrowserFullScreenError");

        return this
    },

    element: function() {
        return window // is this the best way to handle this?
    },

})
