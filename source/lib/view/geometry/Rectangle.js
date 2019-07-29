"use strict"

/*
    Rectangle

    Class to represent a rectangle.

    NOTES

    For top & bottom, we assume we are using screen coordinates so:

        top = x
    
    and:

        bottom = x + height

*/

ideal.Proto.newSubclassNamed("Rectangle").newSlots({
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
        return this.type() + "(" + this.origin().asString() + ", " + this.size().asString() + ")"
    },

    // x, y

    x: function() {
        return this.origin().x();
    },

    y: function() {
        return this.origin().y();
    },

    // width, height

    width: function() {
        return this.size().x();
    },

    height: function() {
        return this.size().y();
    },

    // top, bottom

    top: function() {
        return this.y() 
    },

    bottom: function() {
        return this.y() + this.height() 
    },

    // left, right

    left: function() {
        return this.x() 
    },

    right: function() {
        return this.x() + this.width() 
    },

})
