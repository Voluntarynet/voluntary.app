"use strict"

Object.uuid = function() {
    const uuid_a = Math.floor(Math.random() * Math.pow(10, 17)).toBase64()
    const uuid_b = Math.floor(Math.random() * Math.pow(10, 17)).toBase64()
    return uuid_a + uuid_b
}

Object._puuidWeakMap = new WeakMap();

Object.prototype.puuid = function() {
    const map = Object._puuidWeakMap

    if (!map.has(this)) {
        this.setPid(Object.uuid())
    }

    return map.get(this);
}

Object.prototype.setPid = function(puuid) {
    Object._puuidWeakMap.set(this, puuid);
    return this
}

/*
Object.prototype.typeId = function() {
    const puuid = this.puuid()
    if (Type.isFunction(this.type)) {
        return this.type() + puuid
    }
    return Type.typeName(this) + "_" + puuid
}
*/