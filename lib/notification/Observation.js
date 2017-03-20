
Observation = ideal.Proto.extend().setType("Observation").newSlots({
    target: null,
    name: null,
    observer: null,
    center: null,
    debug: false,
}).setSlots({
    init: function() {
    },
    
    matchesNotification: function(note) {
        var matchesTarget = note.sender() == this.target() || this.target() == null
        var matchesName = note.name() == this.name()
        return matchesTarget && matchesName
    },
    
    sendNotification: function(note) {
        if (this.center().isDebugging()) {
            //console.log(this._observer + " received note " + note.name() + " from " + note.sender() )
        }
        this._observer[this._name].apply(this._observer, [note])
    },
    
    isEqual: function(obs) {
        var sameName = this.name() == obs.name() 
        var sameObserver = this.observer() == obs.observer() 
        var sameTarget = this.target() == obs.target()
        return sameName && sameObserver && sameTarget
    },
    
    watch: function() {
        this.center().addObservation(this)
        return this
    },
    
    stopWatching: function() {
        this.center().removeObservation(this)
        return this
    },    
})

