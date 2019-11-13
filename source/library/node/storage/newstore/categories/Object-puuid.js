"use strict"

Object.defineSlots(Object, {
    uuid: function() {
        const uuid_a = Math.floor(Math.random() * Math.pow(10, 17)).toBase64()
        const uuid_b = Math.floor(Math.random() * Math.pow(10, 17)).toBase64()
        return uuid_a + uuid_b
    },

    _puuidWeakMap: new WeakMap(),
})

Object.defineSlots(Object.prototype, {

    puuid: function() {
        if (!this.hasPuuid()) {
            this.setPuuid(Object.uuid())
        }

        return Object._puuidWeakMap.get(this);
    },

    hasPuuid: function() {
        return Object._puuidWeakMap.has(this)
    },

    setPuuid: function(puuid) {
        Object._puuidWeakMap.set(this, puuid);
        return this
    },

    typePuuid: function() {
        const puuid = this.puuid()
        if (Type.isFunction(this.type)) {
            return this.type() + "_" + puuid
        }
        return Type.typeName(this) + "_" + puuid
    },

})
