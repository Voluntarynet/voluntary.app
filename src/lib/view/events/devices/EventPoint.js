"use strict"

/*
    EventPoint

    Class to represent a 2d or 3d point, optionally with a time.

*/

window.Event_hasCachedPoints = function(event) {
    return event._cachedPoints !== undefined
}

window.Event_setCachedPoints = function(event, points) {
    event._cachedPoints = points
}

window.Event_cachedPoints = function(event) {
    return event._cachedPoints
}

window.Event_pushCachedPoint = function(event, point) {
    assert(event._cachedPoints)
    event._cachedPoints.push(point)
}

// ----------------

window.EventPoint = window.Point.extend().newSlots({
    type: "EventPoint",
    id: null,
    state: null,
    target: null, 
    isDown: false,
    overView: null,
}).setSlots({
    init: function () {
        window.Point.init.apply(this)
        return this
    },

    overView: function() {
        if (this._overView === null) {
            this._overView = this.findOverview()
        }
        return this._overView
    },

    findOverview: function() {
        let e = document.elementFromPoint(p.x(), p.y());
        while (e) {
            const view = e._divView
            if (view) {
                this.setOverview(view)
                return view
            }
            e = e.parentElement
        }
        return null
    },
})
