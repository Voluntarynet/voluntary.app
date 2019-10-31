"use strict"

/*
    Point

    Class to represent a 2d or 3d point, optionally with a time.

    TODO: create a separate EventPoint class...

*/

ideal.Proto.newSubclassNamed("Point").newSlots({
    x: 0,
    y: 0,
    z: 0,
    t: 0,
}).setSlots({

    init: function () {
        ideal.Proto.init.apply(this)
        return this
    },

    valueArray: function() {
        return [this._x, this._y, this._z]
    },

    setTimeToNow: function() {
        let d = new Date();
        this._t = d.getTime();
        return this
    },

    copyFrom: function(p, copyDict) {
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
        return this.typeClass().clone().copyFrom(this)
    },

    add: function(p) {
        return this.copy().addInPlace(p)
    },

    subtract: function(p) {
        return this.copy().subtractInPlace(p)
    },

    asString: function() {
        let s = this.type() + "(" + this._x + ", " + this._y 

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
        return (this.x() === p.x()) && (this.y() === p.y()) && (this.z() === p.z()) // && (this.t() === p.t())
    },

    isEqualWithTime: function(p) { // not ideal
        return (this.x() === p.x()) && (this.y() === p.y()) && (this.z() === p.z()) && (this.t() === p.t())
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

    // css

    asCssStringWithUnitSuffix: function(name, unitSuffix) {
        if (!unitSuffix) { 
            unitSuffix = ""
        }

        const us = unitSuffix;
        return name + "(" + this._x + us + "," + this._y + us + "," + this._z + us + ")"
        //const s = this.valueArray().map(v => v + unitSuffix).join(",")
        //return name + "(" + s + ")"
    },

    asCssTranslate3dString: function() {
        return this.asCssStringWithUnitSuffix("translate3d", "px")
    },

    asCssRotate3dDegreesString: function() {
        return this.asCssStringWithUnitSuffix("rotate3d", "deg")
    },

    asCssScale3dString: function() {
        return this.asCssStringWithUnitSuffix("scale3d", "")
    },

    // size - TODO: move to Size type?

    width: function() {
        return this.x()
    },

    height: function() {
        return this.y()
    },


})
