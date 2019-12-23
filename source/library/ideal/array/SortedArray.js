"use strict"

/*

    SortedArray

    A subclass of IndexedArray that maintains it's items in sorted order. 
    The sort closure should return 
    
    Efficiency:

    Once sorted, a binary insert would be faster.
    TODO: remove didMutate method when sortFunc is not defined?

    
    Example use:

        const sa = SortedArray.clone()
        sa.setSortFunc(function (a, b) { return a.compare(b) })
        sa.push(someItem) // this will trigger resort

*/

window.SortedArray = class SortedArray extends IndexedArray {

    static initThisClass () {
        if (this.prototype.hasOwnProperty("initPrototype")) {
            this.prototype.initPrototype.apply(this.prototype)
        }
        return this
    }

    initPrototype () {

    }

    init () {
        super.init()
        Object.defineSlot(this, "_isSorting", false)
        Object.defineSlot(this, "_sortFunc", null)
    }

    doesSort () {
        return !Type.isNull(this._sortFunc)
    }

    setSortFunc (aFunc) {
        if (this._sortFunc !== aFunc) {
            this._sortFunc = aFunc
            this.resort()
        }
        return this
    }

    sortFunc () {
        return this._sortFunc
    }


    // sort

    didChangeSlotSortFunc (oldValue, newValue) {
        this.resort()
    }

    resort () {
        if (this._sortFunc && this.length && !this._isSorting) {
            this._isSorting = true
            this.sort(this._sortFunc)
            this._isSorting = false
        }
        return this
    }

    needsResortOnForSlot (slotName) {
        const nonOrderChangingSlots = ["sort", "pop", "shift", "removeAt", "remove", "removeAll"]
        return !nonOrderChangingSlots.contains(slotName)
    }

    didMutate (slotName, optionalValue) {
        if (this._isSorting) {
            return
        }

        super.didMutate(slotName, optionalValue)

        if (this.needsResortOnForSlot(slotName)) {
            this.resort()
        }
    }
    
    // --------------------------------

    static selfTest () {
        let sa = this.clone() 
        sa.setSortFunc((a, b) => { return a - b })
        sa.push(3, 1, 2)
        assert(sa.isEqual([1, 2, 3]))
        return this
    }

}.initThisClass() //.selfTest()
