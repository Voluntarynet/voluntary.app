

CSSRuleSet = ideal.Proto.extend().newSlots({
    type: "CSSRuleSet",
    declarations: null,
    key: null,
}).setSlots({
    init: function() {
        this.setDeclarations({})
    },
    
    decAt: function(k) {
        var dec = this.declarations()[k]
        if (!dec) {
            dec = CSSDeclaration.clone().setRuleSet(this).setKey(k)
            this.declarations()[k] = dec
        }
        return dec
    },

    applyToElement: function(anElement) {        
        var dict = this.declarations()
        
        dict.slotValues().forEach(function(declaration) {
            declaration.applyToElement(anElement)
        })
        
        return this
    },
    
    setDict: function(dict) {
        for (var k in dict) {
            if (dict.hasOwnProperty(k)) {
                this.decAt(k).setValue(dict[k])
            }
        }
        return this
    },
})
