"use strict"

/*

    SVGCircle

*/


window.SVGCircle = DomView.extend().newSlots({
    type: "SVGCircle",
    x: 0,
    y: 0,
    radius: 10,
    fill: "white",
    stroke: "none",
}).setSlots({
    init: function () {
        DomView.init.apply(this)
        return this
    },
    
    private_setAttributeNS: function(key, newValue) {
        // TODO: type checking? type conversion?

        /*
        const oldValue = this.private_GetAttributeNS(key)
        if (oldValue !== value) {
            this.willUpdateAttributeNS(key, newValue)
            this.element().setAttributeNS(null, key, newValue);
            this.didUpdateAttributeNS(key, newValue)
        }
        */

        this.element().setAttributeNS(null, key, newValue);

        return this
    },

    private_GetAttributeNS: function(key) {
        let v = this.element().getAttributeNS(key);
        return v
    },

    setX: function (v) {
        this._x = v;
        this.private_setAttributeNS("cx", v);
        return this
    },
    
    setY: function(v) {
        this._y = v;
        this.private_setAttributeNS("cy", v);
        return this
    },
    
    setRadius: function(v) {
        this._radius = v
        this.private_setAttributeNS("r", v);
        return this
    },
    
    setFill: function(v) {
        this._fill = v;
        this.private_setAttributeNS("fill", v);
        return this
    },
    
    setStroke: function(v) {
        this._stroke = v;
        this.private_setAttributeNS("stroke", v);
        return this
    },
    
    createElement: function() {
        const svgNS = "http://www.w3.org/2000/svg";  
        const e = document.createElementNS(svgNS, "circle"); //to create a circle. for rectangle use "rectangle"
        return e
    },
    

    mapToScreen: function() {
        // this.threeJSView().screenPositionForPoint()
    },
    
    show: function() {
        const v = this.position()
        console.log("3d position: " + v.x + ", " + v.y + ", " + v.z)
        console.log("  screen xy: " + this.x() + ", " + this.y())
        return this
    },
    
})
    