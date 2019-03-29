
"use strict"

/*

    DivTransform
         

    // this.titleView().setBorderRadius("8px 8px 0px 8px") // top-left, top-right,  bottom-right, bottom-left
    // TODO: em vs px support?

*/



window.Transform = ideal.Proto.extend().newSlots({
    type: "ThingView",
    position: null, // in px units 
    rotation: null, // in degrees units
    scale: null,
}).setSlots({
    init: function () {
        ideal.Proto.init.apply(this)
        this.setPosition(Point.clone())
        this.setRotation(Point.clone())
        this.setScale(Point.clone())
        return this
    },

    // css

    translate3dString: function() {
        const s = this.position().valueArray().map(v => v + "px").join(",")
        return "translate3d(" + s + ")"
    },

    rotate3dString: function() {
        const s = this.rotation().valueArray().map(v => v + "deg").join(",")
        return "rotate3d(" + s + ")"
    },

    scale3dString: function() {
        const s = this.scale().valueArray().join(",")
        return "scale3d(" + s + ")"
    },

    cssString: function() {
        // NOTE: multiple transform one line directives are applied from right to left
        const s = this.scale3dString() + " " + this.translate3dString() + " " + this.rotate3dString() // is this the expected order?
        return s
    },

    // operations

    copy: function() {
        const t = Transform.clone()
        t.position().copy(this.position())
        t.rotation().copy(this.rotation())
        t.scale().copy(this.scale())
        return t
    },


    addInPlace: function(otherTransform) {
        this.position().addInPlace(otherTransform.position())
        this.rotation().addInPlace(otherTransform.rotation())
        this.scale().addInPlace(otherTransform.scale())
        return this
    },

    /*
    add: function(aTransform) {
        const t = this.copy()
        t.position().addInPlace(aTransform.position())
        t.rotation().addInPlace(aTransform.rotation())
        t.scale().addInPlace(aTransform.scale())
        return t
    },


    subtract: function(aTransform) {
        const t = this.copy()
        t.position().subtractInPlace(aTransform.position())
        t.rotation().subtractInPlace(aTransform.rotation())
        t.scale().subtractInPlace(aTransform.scale())
        return t
    },
    */


})