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
}).setSlots({

    init: function () {
        return this
    },
    
    setToMouseEventWinPos: function(event) {
        this.set(event.clientX, event.clientY)
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
        if (z || z == 0) {
            this._z = z
        }
        if (t || t == 0) {
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

    add: function(p) {
        return Point.clone().copyPoint(this).addInPlace(p)
    },

    subtract: function(p) {
        return Point.clone().copyPoint(this).subtractInPlace(p)
    },

    asString: function() {
        return "" + this._x + "x, " + this._y + "y, " + this._z + "z, " + this._t + "t"
    },
})
