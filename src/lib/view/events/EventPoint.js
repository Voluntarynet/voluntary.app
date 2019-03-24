"use strict"

/*
    EventPoint

    Class to represent a 2d or 3d point, optionally with a time.

*/

window.EventPoint = window.Point.extend().newSlots({
    type: "EventPoint",
    id: null,
    state: null,
    target: null, 
    isDown: false,
    //overElement: null,
    overView: null,
}).setSlots({
    init: function () {
        window.Point.init.apply(this)
        return this
    },

    findOverview: function() {
        let e = document.elementFromPoint(p.x(), p.y());
        while (e) {
            let view = e._divView
            if (view) {
                this.setOverview(view)
                return view
            }
            e = e.parentElement
        }
        return null
    },
})
