

Notification = ideal.Proto.extend().setType("Notification").newSlots({
    name: null,
    sender: null,
    info: null,
    center: null,
    senderStack: null,
}).setSlots({
    init: function() {
    },
    
    isEqual: function(obs) {
        if (this == obs) { 
            return true 
        }
        
        var sameName = this.name() == obs.name() 
        var sameSender = this.sender() == obs.sender() 
        // TODO: testing equivalence of info?
        
        return sameName && sameSender
    },
    
    post: function() {
        if (this.center().isDebugging()) {
            console.log(this.sender() + " posting note " + this.name())
            //this._senderStack = new Error().stack;
        }
        
        this.setSenderStack(new Error().stack);
       
        this.center().addNotification(this)
        return this
    },
})

