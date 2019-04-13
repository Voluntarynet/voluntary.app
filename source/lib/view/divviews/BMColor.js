"use strict"

/*
    
    BMColor
    
    Helpful for manipulating css colors.
	
*/

window.BMColor = ideal.Proto.extend().newSlots({
    type: "BMColor",
    red: 0, // values between 0.0 and 1.0
    green: 0,
    blue: 0,
    opacity: 1,
    //isMutable: true,
}).setSlots({
    init: function () {
        ideal.Proto.init.apply(this)
    },

    copy: function() {
        return BMColor.clone().set(this.red(), this.green(), this.blue(), this.opacity())
    },

    set: function(r, g, b, opacity) {
        this.setRed(r)
        this.setGreen(g)
        this.setBlue(b)

        if (!opacity) {
            this.setOpacity(0)
        } else {
            this.setOpacity(opacity)
        }

        return this
    },

    // conversion helpers

    v255toUnit: function(v) {
        return v / 255;
    },

    unitTo255: function(v) {
        return Math.round(v * 255)
    },

    red255: function() {
        return this.unitTo255(this.red());
    },

    green255: function() {
        return this.unitTo255(this.green());
    },

    blue255: function() {
        return this.unitTo255(this.blue());
    },

    /*
    setCssColorString: function(s) {

    },
    */

    cssColorString: function() {
        return "rgba(" + this.red255() + ", " + this.green255() + ", " + this.blue255() + ", " + this.opacity()  + ")"
    },

    // operations

    interpV1V2Ratio(v1, v2, r) {
        const diff = v2 - v1;
        if (v1 > v2) {
            return v1 - (v1 - v2)*r
        }
        return v2 - (v2 - v1)*r
    },

    interpolateWithColorTo: function(other, v) {
        const r1 = this.red()
        const g1 = this.green()
        const b1 = this.blue()
        const o1 = this.opacity()

        const r2 = other.red()
        const g2 = other.green()
        const b2 = other.blue()
        const o2 = other.opacity()

        const r = this.interpV1V2Ratio(r1, r2, v)
        const g = this.interpV1V2Ratio(g1, g2, v)
        const b = this.interpV1V2Ratio(b1, b2, v)
        const o = this.interpV1V2Ratio(o1, o2, v)

        const result = BMColor.clone().set(r, g, b, o)
        return result
    },

    darken: function(v) {
        assertDefined(v)
        const r = this.red()
        const g = this.green()
        const b = this.blue()
        this.setRed(r * v)
        this.setGreen(g * v)
        this.setBlue(b * v)
        return this
    },

    lighten: function(v) {
        assertDefined(v)
        const r = this.red()
        const g = this.green()
        const b = this.blue()
        this.setRed(r + (1 - r) * v)
        this.setGreen(g + (1 - g) * v)
        this.setBlue(b + (1 - b) * v)
        return this
    },

    whiteColor: function() {
        return BMColor.clone().set(1, 1, 1, 1)
    },

    blackColor: function() {
        return BMColor.clone().set(0, 0, 0, 1)
    },

    lightGrayColor: function() {
        return BMColor.clone().set(0.75, 0.75, 0.55, 1)
    },

    grayColor: function() {
        return BMColor.clone().set(0.5, 0.5, 0.5, 1)
    },

    grayColor: function() {
        return BMColor.clone().set(0.25, 0.25, 0.25, 1)
    },

    redColor: function() {
        return BMColor.clone().set(1, 0, 0, 1)
    },

    greenColor: function() {
        return BMColor.clone().set(0, 1, 0, 1)
    },

    blueColor: function() {
        return BMColor.clone().set(0, 0, 1, 1)
    },

    yellowColor: function() {
        return BMColor.clone().set(1, 1, 0, 1)
    },

})

