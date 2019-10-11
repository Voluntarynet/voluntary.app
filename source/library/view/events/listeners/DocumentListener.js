"use strict"

/*
    DocumentListener

    Listens to a set of document related events.

*/

EventSetListener.newSubclassNamed("DocumentListener").newSlots({
}).setSlots({
    init: function () {
        EventSetListener.init.apply(this)
        return this
    },

    setupEventsDict: function() {
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

    listenTarget: function() {
        return window // is this the best way to handle this?
    },
})
