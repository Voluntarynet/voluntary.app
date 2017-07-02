
CSSDeclaration = ideal.Proto.extend().newSlots({
    type: "CSSDeclaration",
    key: null,
    value: null,
    ruleSet: null,
}).setSlots({
    init: function() {
    },
    
    applyToElement: function(anElement) {
        anElement.style[this.key()] = this.value()
        if (this.key() == "left") {
            console.log("apply " + this.ruleSet().key() + " " + this.key() + ":" + this.value())
        }
        return this
    },
    
    set: function(key, value) {
        this.setKey(key)
        this.setValue(value)
        return this
    },

    setKey: function(k) {
       this._key = assertDefined(k)
       return this
    },
        
    setValue: function(v) {
       this._value = assertDefined(v)
       return this
    },
})
