"use strict"

/*
    Point

    Class to represent a 2d or 3d point, optionally with a time.

*/

window.Point = ideal.Proto.extend().newSlots({
    type: "Point",
    x: 0,
    y: 0,
    z: 0,
    t: 0,
    id: null,
    target: null, 
}).setSlots({

    init: function () {
        return this
    },

    // helpers for events , TODO: move to a UIEvent class

    setToTouchEventWinPos: function(touch) {
        this.set(touch.pageX, event.pageY)
        this.setId(touch.identifier)
        this.setTarget(touch.target)
        this.setTimeToNow()
        return this
    },
    
    setToMouseEventWinPos: function(event) {
        let b = event.buttons
        let id = "UnknownMouseButtonState"
        if (b === 0) {
            id = "mouse" // no button, e.g. mouse move event sans button
        } else if (b & 1) {
            id = "mouseWithButton1" // primary button
        } else if (b & 2) {
            id = "mouseWithButton2" // secondary button
        } else if (b & 4) {
            id = "mouseWithButton3"
        }
        this.setId(id)

        this.set(event.pageX, event.pageY)
        this.setTarget(event.target)
        this.setTimeToNow()
        return this
    },

    setTimeToNow: function() {
        let d = new Date();
        this._t = d.getTime();
        return this
    },

    copyPoint: function(p) {
        this._x = p._x
        this._y = p._y
        this._z = p._z
        this._t = p._t
        return this
    },
    
    set: function(x, y, z, t) {
        this._x = x;
        this._y = y;
        if (z || z === 0) {
            this._z = z
        }
        if (t || t === 0) {
            this._t = t
        }
        return this
    },

    addInPlace: function(p) {
        this._x += p._x
        this._y += p._y
        this._z += p._z
        this._t += p._t
        return this
    },

    subtractInPlace: function(p) {
        this._x -= p._x
        this._y -= p._y
        this._z -= p._z
        this._t -= p._t
        return this
    },

    floorInPlace: function() {
        this._x = Math.floor(this._x)
        this._y = Math.floor(this._y)
        this._z = Math.floor(this._z)
        return this
    },

    copy: function() {
        return Point.clone().copyPoint(this)
    },

    add: function(p) {
        return this.copy().addInPlace(p)
    },

    subtract: function(p) {
        return this.copy().subtractInPlace(p)
    },

    asString: function() {
        let s = "Point(" + this._x + ", " + this._y 

        if (this._z) { 
            s += ", " + this._z
        }

        /*
        if (this._t) { 
            s += ", " + this._t + "t" 
        }
        */

        return s + ")"
    },

    distanceFromOrigin: function() {
        let ds = Math.pow(this.x(), 2) + Math.pow(this.y(), 2) + Math.pow(this.z(), 2)
        return Math.sqrt(ds)
    },

    // difference with another point

    dxFrom: function(p) {
        return this.x() - p.x()
    },

    dyFrom: function(p) {
        return this.y() - p.y()
    },

    dzFrom: function(p) {
        return this.z() - p.z()
    },

    dtFrom: function(p) {
        return this.t() - p.t()
    },

    distanceFrom: function(p) {
        let dx = this.dxFrom(p)
        let dy = this.dyFrom(p)
        let dz = this.dzFrom(p)
        return Math.sqrt(dx*dx + dy*dy + dz*dz)
    },

    // eqaulity

    isEqual: function(p) {
        return (this.x() == p.x()) && (this.y() == p.y()) && (this.z() == p.z()) // && (this.t() == p.t())
    },

    isEqualWithTime: function(p) { // not ideal
        return (this.x() == p.x()) && (this.y() == p.y()) && (this.z() == p.z()) && (this.t() == p.t())
    },

    // comparison 

    isGreaterThan: function(p) {
        return this.x() > p.x() && this.y() > p.y()
    },

    isLessThan: function(p) {
        return this.x() < p.x() && this.y() < p.y()
    },

    isGreaterThanOrEqualTo: function(p) {
        return this.x() >= p.x() && this.y() >= p.y()
    },

    isLessThanOrEqualTo: function(p) {
        return this.x() <= p.x() && this.y() <= p.y()
    },

    angleInRadians: function() {
        return Math.atan2(y, x);
    },

    angleInDegrees: function() {
        return this.angleInRadians() * 180 / Math.PI;
    },

    angleInRadiansTo: function(p) {
        return p.subtract(this).angleInRadians()
    },

    angleInDegreesTo: function(p) {
        return p.subtract(this).angleInDegrees()
    },

    midpointTo: function(p) {
        return this.add(p).divideByScalar(2)
    },

    multiplyByScalar: function(v) {
        let p = Point.clone()
        p.set(this.x() * v, this.y() * v, this.z() * v)
        return p
    },

    divideByScalar: function(v) {
        return this.multiplyByScalar(1/v)
    },

    negated: function(p) {
        return this.multiplyByScalar(-1)
    },
})