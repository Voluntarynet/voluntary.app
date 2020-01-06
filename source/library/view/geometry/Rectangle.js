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

window.Rectangle = class Rectangle extends ProtoClass {
    initPrototype () {
        this.newSlot("origin", null)
        this.newSlot("size", null)
    }

    init () {
        super.init()
        this.setOrigin(Point.clone())
        this.setSize(Point.clone())
        return this
    }
    
    containsPoint(p) {
        const a = p.isGreaterThanOrEqualTo(this.origin()) 
        const b = p.isLessThanOrEqualTo(this.maxPoint())
        return a && b
    }

    containsRectangle(r) {
        return r.origin().isGreaterThanOrEqualTo(this.origin()) && r.maxPoint().isLessThanOrEqualTo(this.maxPoint())
    }

    maxPoint() {
        return this.origin().add(this.size())
    }

    asString() {
        return this.type() + "(" + this.origin().asString() + ", " + this.size().asString() + ")"
    }

    // x, y

    x() {
        return this.origin().x();
    }

    y() {
        return this.origin().y();
    }

    // width, height

    width() {
        return this.size().x();
    }

    height() {
        return this.size().y();
    }

    // top, bottom

    top() {
        return this.y() 
    }

    bottom() {
        return this.y() + this.height() 
    }

    // left, right

    left() {
        return this.x() 
    }

    right() {
        return this.x() + this.width() 
    }

}.initThisClass()
