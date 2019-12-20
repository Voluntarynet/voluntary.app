Object.defineSlots(Object.prototype, {

    isMutator: function() {
        return this.associationAt("_isMutator")
    },

    setIsMutator: function(v) {
        assert(Type.isBoolean(v))
        return this.associationAtPut("_isMutator", v)
    },

    mutatorMethodNamesSet: function() {
        const names = new Set()
        for (var k in this) {
            const v = this[k]
            if (Type.isFunction(v)) {
                if (v.isMutator()) {
                    names.add(k)
                }
            }
        }
        return names
    },
})