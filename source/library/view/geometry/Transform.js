
"use strict"

/*

    DivTransform
         

    // this.titleView().setBorderRadius("8px 8px 0px 8px") // top-left, top-right,  bottom-right, bottom-left
    // TODO: em vs px support?

*/

window.Transform = class Transform extends ProtoClass {
    initPrototype () {
        this.newSlot("position", null).setComment("in px units") 
        this.newSlot("rotation", null).setComment("in degrees units") 
        this.newSlot("scale", null)
    }

    init () {
        super.init()
        this.setPosition(Point.clone())
        this.setRotation(Point.clone())
        this.setScale(Point.clone())
        return this
    }

    // css

    cssString() {
        // NOTE: multiple transform one line directives are applied from right to left
        const s = 
          this.scale().asCssTranslate3dString() + " " 
        + this.position().asCssTranslate3dString() + " " 
        + this.rotation().asCssRotate3dDegreesString(); // is this the expected order?
        return s
    }

    // operations

    copy() {
        const t = Transform.clone()
        t.position().copy(this.position())
        t.rotation().copy(this.rotation())
        t.scale().copy(this.scale())
        return t
    }


    addInPlace(otherTransform) {
        this.position().addInPlace(otherTransform.position())
        this.rotation().addInPlace(otherTransform.rotation())
        this.scale().addInPlace(otherTransform.scale())
        return this
    }

    /*
    add(aTransform) {
        const t = this.copy()
        t.position().addInPlace(aTransform.position())
        t.rotation().addInPlace(aTransform.rotation())
        t.scale().addInPlace(aTransform.scale())
        return t
    }


    subtract(aTransform) {
        const t = this.copy()
        t.position().subtractInPlace(aTransform.position())
        t.rotation().subtractInPlace(aTransform.rotation())
        t.scale().subtractInPlace(aTransform.scale())
        return t
    }
    */
   
}.initThisClass()