"use strict"

Object.defineSlots(Object, {


})

Object.defineSlots(Object.prototype, {

    setMutationObservers: function(aSet) {
        if (!this._mutationObservers) {
            Object.defineSlot(this, "_mutationObservers", aSet) 
        }
        return this
    },

    mutationObservers: function() {
        return this._mutationObservers
    },

    addMutationObserver: function(anObserver) {
        if (!this._mutationObservers) {
            this.setMutationObservers(new Set())
        }
        
        this.mutationObservers().add(anObserver)
        return this
    },

    removeMutationObserver: function(anObserver) {
        this.mutationObservers().delete(anObserver)
        return this
    },


    // --- ---

    willMutate: function() {
        /*
        if (this._mutationObservers) {
            this.mutationObservers().forEach(v => { 
                v.onWillMutateObject(this)
            })
        }
        */
    },

    didMutate: function() {
        if (this._mutationObservers) {
            this.mutationObservers().forEach(v => { 
                v.onDidMutateObject(this)
            })
        }
    },

})
