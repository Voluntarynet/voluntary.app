"use strict"

/*
    AnimationListener

    Listens to a set of animation events.

*/

window.AnimationListener = class AnimationListener extends EventSetListener {
    
    initPrototype () {

    }

    init () {
        super.init()
        return this
    }

    setupEventsDict () {
        this.addEventNameAndMethodName("animationend", "onAnimationEnd");
        this.addEventNameAndMethodName("animationiteration", "onAnimationIteration");
        this.addEventNameAndMethodName("animationstart", "onAnimationStart");
        return this
    }

}.initThisClass()
