"use strict"

/*
    Point

    Class to represent a 2d or 3d point, optionally with a time.

    TODO: create a separate EventPoint class...

*/


window.Point = class Point extends ProtoClass {
    initPrototype () {
        this.newSlot("x", 0)
        this.newSlot("y", 0)
        this.newSlot("z", 0)
        this.newSlot("t", 0)
    }

    init () {
        super.init()
        return this
    }

    valueArray() {
        return [this._x, this._y, this._z]
    }

    setTimeToNow() {
        const d = new Date();
        this._t = d.getTime();
        return this
    }

    copyFrom(p, copyDict) {
        this._x = p._x
        this._y = p._y
        this._z = p._z
        this._t = p._t
        return this
    }
    
    set(x, y, z, t) {
        this._x = x;
        this._y = y;
        if (z || z === 0) {
            this._z = z
        }
        if (t || t === 0) {
            this._t = t
        }
        return this
    }

    addInPlace(p) {
        this._x += p._x
        this._y += p._y
        this._z += p._z
        this._t += p._t
        return this
    }

    subtractInPlace(p) {
        this._x -= p._x
        this._y -= p._y
        this._z -= p._z
        this._t -= p._t
        return this
    }

    floorInPlace() {
        this._x = Math.floor(this._x)
        this._y = Math.floor(this._y)
        this._z = Math.floor(this._z)
        return this
    }

    copy() {
        return this.thisClass().clone().copyFrom(this)
    }

    add(p) {
        return this.copy().addInPlace(p)
    }

    subtract(p) {
        return this.copy().subtractInPlace(p)
    }

    asString() {
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
    }

    distanceFromOrigin() {
        const ds = Math.pow(this.x(), 2) + Math.pow(this.y(), 2) + Math.pow(this.z(), 2)
        return Math.sqrt(ds)
    }

    // difference with another point

    dxFrom(p) {
        return this.x() - p.x()
    }

    dyFrom(p) {
        return this.y() - p.y()
    }

    dzFrom(p) {
        return this.z() - p.z()
    }

    dtFrom(p) {
        return this.t() - p.t()
    }

    distanceFrom(p) {
        const dx = this.dxFrom(p)
        const dy = this.dyFrom(p)
        const dz = this.dzFrom(p)
        return Math.sqrt(dx*dx + dy*dy + dz*dz)
    }

    // eqaulity

    isEqual(p) {
        return (this.x() === p.x()) && (this.y() === p.y()) && (this.z() === p.z()) // && (this.t() === p.t())
    }

    isEqualWithTime(p) { // not ideal
        return (this.x() === p.x()) && (this.y() === p.y()) && (this.z() === p.z()) && (this.t() === p.t())
    }

    // comparison 

    isGreaterThan(p) {
        return this.x() > p.x() && this.y() > p.y()
    }

    isLessThan(p) {
        return this.x() < p.x() && this.y() < p.y()
    }

    isGreaterThanOrEqualTo(p) {
        return this.x() >= p.x() && this.y() >= p.y()
    }

    isLessThanOrEqualTo(p) {
        return this.x() <= p.x() && this.y() <= p.y()
    }

    angleInRadians() {
        return Math.atan2(y, x);
    }

    angleInDegrees() {
        return this.angleInRadians() * 180 / Math.PI;
    }

    angleInRadiansTo(p) {
        return p.subtract(this).angleInRadians()
    }

    angleInDegreesTo(p) {
        return p.subtract(this).angleInDegrees()
    }

    midpointTo(p) {
        return this.add(p).divideByScalar(2)
    }

    multiplyByScalar(v) {
        const p = Point.clone()
        p.set(this.x() * v, this.y() * v, this.z() * v)
        return p
    }

    divideByScalar(v) {
        return this.multiplyByScalar(1/v)
    }

    negated(p) {
        return this.multiplyByScalar(-1)
    }

    // css

    asCssStringWithUnitSuffix(name, unitSuffix) {
        if (!unitSuffix) { 
            unitSuffix = ""
        }

        const us = unitSuffix;
        return name + "(" + this._x + us + "," + this._y + us + "," + this._z + us + ")"
        //const s = this.valueArray().map(v => v + unitSuffix).join(",")
        //return name + "(" + s + ")"
    }

    asCssTranslate3dString() {
        return this.asCssStringWithUnitSuffix("translate3d", "px")
    }

    asCssRotate3dDegreesString() {
        return this.asCssStringWithUnitSuffix("rotate3d", "deg")
    }

    asCssScale3dString() {
        return this.asCssStringWithUnitSuffix("scale3d", "")
    }

    // size - TODO: move to Size type?

    width() {
        return this.x()
    }

    height() {
        return this.y()
    }


}.initThisClass()
