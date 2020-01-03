"use strict"

/*
    
    Event-cachedPoints

*/


Object.defineSlots(Event.prototype, {
    hasCachedPoints: function() {
        return this._cachedPoints !== undefined
    },

    setCachedPoints: function(points) {
        this._cachedPoints = points
    },

    cachedPoints: function() {
        return this._cachedPoints
    },
    
    pushCachedPoint: function(point) {
        assert(this._cachedPoints)
        this._cachedPoints.push(point)
    }
})

