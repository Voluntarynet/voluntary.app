"use strict"

Object.defineSlots(Object, {
    /*
    newUuid: function() {
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    },
    */

    newUuid: function() { // TODO: move this JS UUID when it's added to JS standard lib
        const uuid_a = Math.floor(Math.random() * Math.pow(10, 17)).toBase64()
        const uuid_b = Math.floor(Math.random() * Math.pow(10, 17)).toBase64()
        return uuid_a + uuid_b
    },

})

Object.defineSlots(Object.prototype, {

    _puuid: undefined,

    puuid: function() {
        if (!this.hasPuuid()) {
            this.setPuuid(Object.newUuid())
        }

        return this["_puuid"]
    },

    hasPuuid: function() {
        return Object.prototype.hasOwnProperty.apply(this, ["_puuid"])
    },

    setPuuid: function(puuid) {
        assert(!Type.isNullOrUndefined(puuid))
        if (this.hasPuuid()) {
            let oldPid = this["_puuid"]
            this.defaultStore().onObjectUpdatePid(this, oldPid, puuid)
        }
        this["_puuid"] = puuid
        return this
    },

    typePuuid: function() {
        const puuid = this.puuid()
        if (Type.isFunction(this.type)) {
            return this.type() + "_" + puuid
        }
        return Type.typeName(this) + "_" + puuid
    },

    typeId: function() {
        return this.typePuuid()
    },

    type: function() {
        return this.constructor.name
    },

    //
    // Unserializing - how it works
    //
    // we don't want objects to call scheduleStore on slot updates 
    // while they are unserializing (since those slots are *already* 
    // in the store as we are reading them from the store)
    //
    // To avoid this, Objects should call this.setIsUnserializing(true) in init()
    // and scheduleFinalize. At the end of the event loop, their
    // finalize() will be called it will this.setIsUnserializing(false)
    //
    // Inside didUpdateSlot(), scheduleStore isn't called if isUnserializing is true
    //
    //

    /*
    _isUnserializing: false,

    isUnserializing: function() {
        return this._isUnserializing
    },

    setIsUnserializing: function(aBool) {
        this._isUnserializing = aBool
        return this
    },
    */

    // is finalized
    //
    //  we don't want to scheduleSyncToStore while the object is initializing
    // (e.g. while it's being unserialized from a store)
    // so only scheduleSyncToStore if isFinalized is true, and set it to true
    // when finalize is called by the ObjectStore after 


    _isFinalized: false,

    isFinalized: function() {
        return this._isFinalized
    },

    setIsFinalized: function(aBool) {
        this._isFinalized = aBool
        return this
    },

    finalize: function() {
        // for subclasses to override if needed
        this.setIsFinalized(true)
    },

    init: function() {
        this.scheduleFinalize()
    },

    scheduleFinalize () {
        if (window["Scheduler"]) {
            window.SyncScheduler.shared().scheduleTargetAndMethod(this, "finalize")
        } else {
            setTimeout(() => { this.finalize() }, 0)
        }
    },

})
