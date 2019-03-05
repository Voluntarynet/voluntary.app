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
        return p.isGreaterThanOrEqualTo(this.origin()) && p.isLessThanOrEqualTo(this.maxPoint())
    },

    containsRectangle: function(r) {
        return r.origin().isGreaterThanOrEqualTo(this.origin()) && r.maxPoint().isLessThanOrEqualTo(this.maxPoint())
    },

    maxPoint: function() {
        return this.origin().add(this.size())
    },
})
