"use strict"

/*

    IndexedArray

    A subclass of Array that maintains an dictionary index of the 
    elements of the list via a index closure. The index closure should return 
    a string. For this to work, you need to avoid using the Array 
    operations which can't be overridden:
    
        a[i] -> instead use a.at(i) 
        a[i] = b -> instead use a.atPut(i, b)
        delete a[i] -> instead use a.removeAt(i)
    
    
    Example use:

        const ia = IndexedArray.clone()
        ia.setIndexClosure(item => item.hash())
        ia.push(someItem) // this will trigger reindex
        const hasItem = is.itemForIndexKey(someHash) // this is an O(1) operation

*/

window.IndexedArray = class IndexedArray extends Array {
    static withArray (anArray) {
        return this.clone().copyFrom(anArray)
    }

    static initThisClass () {
        this.prototype.initPrototype()
        return this
    }

    initPrototype () {
        //Object.defineSlot(this, "_index", {}) 

        //this.newSlot("index", null)
        //this.newSlot("indexClosure", null)
    }

    init () {
        Object.defineSlot(this, "_index", {}) 
        Object.defineSlot(this, "_indexClosure", null) 
    }

    // index

    setIndex (aDict) {
        this._index = aDict
    }

    index () {
        return this._index
    }

    // index closure

    setIndexClosure (aDict) {
        this._indexClosure = aDict
    }

    indexClosure () {
        return this._indexClosure
    }

    // -----

    reindex () {
        this.setIndex({})
        this.forEach( v => this.addItemToIndex(v) )
        return this
    }

    hasIndexKey (key) {
        return this.index().hasOwnProperty(key)
    }

    itemForIndexKey (key) {
        if (this.hasIndexKey(key)) {
            return this.index().at(key)
        }
    }

    indexKeyForItem (v) {
        const key = this.indexClosure()(v)
        return key
    }

    addItemToIndex (v) {
        const key = this.indexKeyForItem(v)
        assert(Type.isString(key))
        this.index().atPut(key, v)
        return this
    }

    removeItemFromIndex (v) {
        const key = this.indexKeyForItem(v)
        this.index().removeAt(key)
        return this
    }

    didMutate () {
        super.didMutate()
        this.reindex()
    }

    static selfTest () {
        let ia = window.IndexedArray.clone()
        ia.setIndexClosure(v => v.toString())
        ia.push(123)
        let result = ia.itemForIndexKey("123")
        assert(result === 123)
    }

}.initThisClass()

IndexedArray.selfTest()