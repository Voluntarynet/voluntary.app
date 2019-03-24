"use strict"

/*
    Rectangle

    Class to represent a 2d rectangle.

*/

window.Rectangle = ideal.Proto.extend().newSlots({
    type: "Rectangle",
    origin: null,
    size: null,
}).setSlots({

    init: function () {
        this.setOrigin(Point.clone())
        this.setSize(Point.clone())
        return this
    },
    
    containsPoint: function(p) {
        const a = p.isGreaterThanOrEqualTo(this.origin()) 
        const b = p.isLessThanOrEqualTo(this.maxPoint())
        return a && b
    },

    containsRectangle: function(r) {
        return r.origin().isGreaterThanOrEqualTo(this.origin()) && r.maxPoint().isLessThanOrEqualTo(this.maxPoint())
    },

    maxPoint: function() {
        return this.origin().add(this.size())
    },

    asString: function() {
        return "Rectangle(" + this.origin().asString() + ", " + this.size().asString() + ")"
    },

    x: function() {
        return this.origin().x();
    },

    y: function() {
        return this.origin().y();
    },

    width: function() {
        return this.size().x();
    },

    height: function() {
        return this.size().y();
    },

})
