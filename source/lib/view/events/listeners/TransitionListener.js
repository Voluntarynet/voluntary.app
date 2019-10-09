"use strict"

/*
    TransitionListener

    Listens to a set of animation transition events.

*/

EventSetListener.newSubclassNamed("TransitionListener").newSlots({
}).setSlots({
    init: function () {
        EventSetListener.init.apply(this)
        return this
    },

    setupEventsDict: function() {
        this.addEventNameAndMethodName("transitionrun", "onTransitionRun");
        this.addEventNameAndMethodName("transitionstart", "onTransitionStart");
        this.addEventNameAndMethodName("transitioncancel", "onTransitionCancel");
        this.addEventNameAndMethodName("transitionend", "onTransitionEnd");
        return this
    },
})
