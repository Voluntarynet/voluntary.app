
BMClassifiedPost = BMStorableNode.extend().newSlots({
    type: "BMClassifiedPost",
    price: 0,
    currency: "",
    title: null, // string
    description: null, // string
    path: null, // string
    isEditable: false,
    objMsg: null,
}).setSlots({
    init: function () {
        BMStorableNode.init.apply(this)
        this.setActions(["delete"])
        this.setNodeMinWidth(550)
        
        this.setTitle("Untitled")
        this.setPrice(0)
        this.setDescription("Description")
        this.addStoredSlots(["price", "title", "description"])
        
        this.setObjMsg(BMObjectMessage.clone())

        this._powDoneObs   = NotificationCenter.shared().newObservation().setName("powDone").setObserver(this)
        this._powUpdateObs = NotificationCenter.shared().newObservation().setName("powUpdate").setObserver(this)
    },
    
    // pow notifications
    
    watchPow: function() {
        this._powDoneObs.watch()
        this._powUpdateObs.watch()
    },
    
    unwatchPow: function() {
        this._powDoneObs.stopWatching()
        this._powUpdateObs.stopWatching()
    },
    
    powObj: function() {
        return this.objMsg().payload().powObject()
    },
    
    powUpdate: function(note) {
        if (note.sender() == this.powObj()) {
            //console.log("got powUpdate")
            this.didUpdate()
        }
    },
    
    powDone: function(note) {
        if (note.sender() == this.powObj()) {
            //console.log("got powDone")
            this.unwatchPow()
            this.didUpdate()
            //this.syncToView()
        }
    },
    
    powStatus: function() {
        return this.powObj().status()
    },
    
    subtitle: function() {
        return this.price() + " " + this.currency()
    },
    
    setPrice: function(p) {
        this._price = p; //parseFloat(p)
        return this
    },

/*    
    getPath: function() {
        return this.nodePathString()
    },
*/
    
    postDict: function () {
        return {
            title: this.title(),
            price: parseFloat(this.price()),
            currency: this.currency(),
            description: this.description(),
            path: this.path()
        }
    },
    
    setPostDict: function(aDict) {
        this.setTitle(aDict.title)
        this.setPrice(aDict.price)
        this.setCurrency(aDict.currency)
        this.setDescription(aDict.description)
        this.setPath(aDict.path)
        return this
    },
    
    syncSend: function () {
        this.objMsg().setContent(this.postDict())
        
        //var myId = App.shared().network().localIdentities().current()
        //var toId = App.shared().network().openIdentity().current()        
        this.objMsg().send()
    },
    
    send: function () {
        this.setIsEditable(false)
        this.objMsg().setContent(this.postDict())
        
        //var myId = App.shared().network().localIdentities().current()
        //var toId = App.shared().network().openIdentity().current()
        
        this.watchPow() // watch for pow update and done notifications
        this.objMsg().asyncPackContent() // will send notification when ready        
    },
    
    cancelSend: function() {
        
    },
    
    onDropFiles: function(filePaths) {
        var parts = []
    },
    
    placeInRegion: function() {
        var rootNode = App.shared()
        var pathComponents = this.path().split("/").slice(1)
        var region = rootNode.nodeAtSubpath(pathComponents)
        if (region) {
            console.log("inserting post into region path " + this.path())
            if (!region.containsItem(this)) {
                region.addItem(this)
            }
        } else {
            throw "missing region for path " + this.path()
        }
    },
    
    isEqual: function(aPost) {
        return this.hash() == aPost.hash()
    },
    
    hash: function() {
        return this.postDict().toStableHash()
    },
    
    incrementPowTarget: function() {
        console.log("Post incrementPowTarget")
        this.powObj().incrementDifficulty()
        this.didUpdate()
    },
    
    decrementPowTarget: function() {
        console.log("Post decrementPowTarget")
        this.powObj().decrementDifficulty()
        this.didUpdate()
    },

})
