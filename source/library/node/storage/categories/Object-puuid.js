"use strict"

Object.uuid = function() {
    const uuid_a = Math.floor(Math.random() * Math.pow(10, 17)).toBase64()
    const uuid_b = Math.floor(Math.random() * Math.pow(10, 17)).toBase64()
    return uuid_a + uuid_b
}

Object._puuidWeakMap = new WeakMap();

Object.prototype.puuid = function() {
    if (!this.hasPuuid()) {
        this.setPuuid(Object.uuid())
    }

    return Object._puuidWeakMap.get(this);
}

Object.prototype.hasPuuid = function() {
    return Object._puuidWeakMap.has(this)
}

Object.prototype.setPuuid = function(puuid) {
    Object._puuidWeakMap.set(this, puuid);
    return this
}

Object.prototype.typePuuid = function() {
    const puuid = this.puuid()
    if (Type.isFunction(this.type)) {
        return this.type() + "_" + puuid
    }
    return Type.typeName(this) + "_" + puuid
}
