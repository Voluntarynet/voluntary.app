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

    //_puuidWeakMap: new WeakMap(),

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
        this["_puuid"] = puuid
        return this
    },

    /*
    puuid: function() {
        if (!this.hasPuuid()) {
            this.setPuuid(Object.newUuid())
        }

        return Object._puuidWeakMap.get(this);
    },

    hasPuuid: function() {
        return Object._puuidWeakMap.has(this)
    },

    setPuuid: function(puuid) {
        assert(!Type.isNullOrUndefined(puuid))
        
        if (this.hasPuuid() && this.puuid() !== puuid) {
            // hook this situation? It should be rare.   
        }

        Object._puuidWeakMap.set(this, puuid);
        return this
    },
    */

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

})
