"use strict"


/*

    Mirror

*/


/*

Object._mirrors = new WeakMap(); // has, set, get methods

window.ideal.Mirror = class FilePath extends ProtoClass {

}

Object.prototype.mirror = function() {
    let mirror = Object._mirrors.get(this)

    if (!mirror) {
        mirror = ideal.Mirror.clone()
        Object._mirrors.set(this, mirror)
    }

    return mirror
}

*/