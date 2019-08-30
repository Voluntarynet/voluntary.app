"use strict"

/*

    BMClassifiedPost

*/

BMFieldSetNode.newSubclassNamed("BMClassifiedPost").newSlots({
    title: null, // string
    price: 0,
    currency: "BTC",
    description: null, // string
    path: "", // string
    isEditable: false,
    objMsg: null,
    
    postDate: null,
    postPeriod: 30 * 24 * 60 * 60 * 1000, // 30 days in milliseconds
    uuid: null,
    // imagesNode:null,
    imageDataURLs: null,
    hasSent: false,

}).setSlots({
	
    init: function () {
        BMFieldSetNode.init.apply(this)
        this.setShouldStore(true)
        //this.setNodeMinWidth(550)
        
 		this.addStoredField(BMStampField.clone().setKey("stamp").setValueMethod("stamp")).setValueIsEditable(false)
        this.addFieldNamed("path").setKey("path").setValueIsEditable(false)
        this.fieldNamed("path").visibleValue = function () {
            return this.value().split("/").join(" / ")
        }
		
        this.addFieldNamed("title").setKey("title").setValueIsEditable(true)
 		this.addStoredField(BMNumberField.clone().setKey("price").setValueMethod("price")).setValueIsEditable(true).setUnsetVisibleValue(0)


 		this.addStoredField(BMOptionsField.clone().setKey("currency").setValueMethod("currency")).setValueIsEditable(true).setValidValuesMethod("currencySymbols").setNoteMethod("currencyName")
 		this.addStoredField(BMDateField.clone().setKey("sent date").setValueMethod("postDate")).setValueIsEditable(false).setUnsetVisibleValue("(not sent yet)")
        this.addStoredField(BMTextAreaField.clone().setKey("description").setValueMethod("description")).setValueIsEditable(true)
        this.addStoredField(BMImageWellField.clone().setKey("drop images here").setValueMethod("imageDataURLs")).setValueIsEditable(true)

        this.setTitle("Untitled")
        this.setPrice(0)
        this.setDescription("Item or service description")
        //this.addStoredSlots(["price", "title", "description", "path", "postDate", "postPeriod", "uuid", "imageDataURLs", "hasSent"])
        this.addStoredSlots(["uuid", "postPeriod", "hasSent"])

        //this.setImagesNode(BMNode.clone().setViewClassName("ImageView").setSubnodeProto("ImageNode"))
        this.setImageDataURL(null) 
        
        this.setObjMsg(BMObjectMessage.clone())

        this._powDoneObs   = NotificationCenter.shared().newObservation().setName("powDone").setObserver(this)
        this._powUpdateObs = NotificationCenter.shared().newObservation().setName("powUpdate").setObserver(this)

        this.setActions(["send"])
        this.setCanDelete(true)

        this.validate()
    },

    setParentNode: function(aNode) {
        BMStorableNode.setParentNode.apply(this, [aNode])
        this.syncDeleteAction()
        return this
    },
	
    syncDeleteAction: function() {
        if (this.parentNode() && this.parentNode().isKindOf(Region)) {
            //this.removeAction("delete")
            this.setCanDelete(false)
        } else {
            //this.addAction("delete")
            this.setCanDelete(true)
        }
        return this
    },

    didLoadFromStore: function() {
        BMStorableNode.didLoadFromStore.apply(this)
        this.setIsEditable(!this.hasSent())
        this.validate()
    },
	
    currencySymbols: function() {
        /*
		return Object.slotNames(CurrenciesDict).map(function (k) {
			return k + " (" + CurrenciesDict[k].name + ")"
		}).sort()
		*/
        return Object.slotNames(CurrenciesDict).sort()
    },
	
    currencyName: function() {
        if (this.currency()) {
            let dict = CurrenciesDict[this.currency()]
            if (dict) {
                return dict.name
            }
        }
        return null
    },
  
    /*  
    // images
    
    setEncodedImages: function(base64images) {
        let imgs = base64images.map(function (b64) { return ImageNode.clone().setBase64Encoded(b64); });
        this.setImages(imgs)
        return this
    },
    
    getEncodedImages: function() {
        return this.images().map(function (image) { return image.base64Encoded(); });
    },
*/
    
    subtitle: function() {
        try {
	        if (this.powObj().isFinding()) {
	            return "stamping... " + this.powObj().estimatedPercentageDone() + "%";
	        } else if (!this.hasSent()) {
	            return "unposted"
	        }
	        return "expires in " + this.expireDescription()
	        //return this.price() + " " + this.currency()
        } catch(e) {
            console.log(e)
        }
        return "error"
    },
    
    postDict: function () {
        return {
            type: "BMClassifiedPost",
            title: this.title(),
            price: parseFloat(this.price()),
            currency: this.currency(),
            description: this.description(),
            path: this.path(),
            postDate: this.postDate(),
            postPeriod: this.postPeriod(),
            uuid: this.uuid(),
            imageDataURLs: this.imageDataURLs()
        }
    },
    
    setPostDict: function(aDict) {
        this.setTitle(aDict.title)
        this.setPrice(aDict.price)
        this.setCurrency(aDict.currency)
        this.setDescription(aDict.description)
        this.setPath(aDict.path)
        this.setPostDate(aDict.postDate)
        this.setPostPeriod(aDict.postPeriod)
        this.setUuid(aDict.uuid)
        this.setImageDataURL(aDict.imageDataURL)
        //this.objMsg().setContent(this.postDict())
        this.objMsg().setContent(aDict)
        return this
    },
    
    syncSend: function () {
        this.objMsg().setContent(this.postDict())
        
        //let myId = App.shared().network().localIdentities().current()
        //let toId = App.shared().network().openIdentity().current()        
        this.objMsg().send()
    },

    choosePostDate: function() {
        let currentTime = new Date().getTime()
        // add a random time interval of 5 mintues so a receiving node
        // can't guess that a sender is the source if the dt is very small
        let randomInterval = Math.random() * 1000 * 60 * 5; 
        this.setPostDate(currentTime + randomInterval)	
        return this	
    },
	
    prepareToSend: function() {
        this.setUuid(GUID()) 
        this.choosePostDate()
        this.objMsg().setData(this.postDict())
        return this
    },
    
    send: function () {
        this.prepareToSend()
        this.setIsEditable(false)
        
        //let myId = App.shared().network().localIdentities().current()
        //let toId = App.shared().network().openIdentity().current()
        
        this.watchPow() // watch for pow update and done notifications
        this.objMsg().asyncPackContent() // will send notification when pow ready        
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
        return this.objMsg().powObj()
    },
    
    powUpdate: function(note) {
        if (note.sender() === this.powObj()) {
            //console.log("got powUpdate")
            this.didUpdateNode()
        }
    },
    
    setupFromDict: function() {
        this.objMsg().setContent(this.postDict())
        //this.setHasSent(true)
        return this    
    },
    
    powDone: function(note) {
        if (note.sender() === this.powObj()) {
            //console.log("got powDone")
            this.unwatchPow()
            if (this.powObj().isValid()) {
                this.objMsg().send()
                this.setHasSent(true)
            }
            this.didUpdateNode()
        }
    },
    
    powStatus: function() {
        return this.powObj().status()
    },
    
    /////////////////////////
    descriptionOfMsTimePeriod: function(ms) {
        
        let seconds = Math.floor(ms / 1000);
        /*
        if (seconds < 60) {
            return seconds + " seconds"
        }
        */
        
        let minutes = Math.floor(seconds / 60);
        /*
        if (minutes < 60) {
            return minutes + " minutes"
        }
        */
        
        let hours = Math.floor(minutes / 60);
        if (hours < 24) {
            //return hours + " hours"
            return "today"
        }
        
        let days = Math.ceil(hours / 24);
        return days + " days"
    },
    
    expireDescription: function() {
        let ms = this.remainingPeriodInMs();
        return this.descriptionOfMsTimePeriod(ms)
    },
    
    expirationDate: function() {
        return new Date(this.postDate() + this.postPeriod())
    },
    
    remainingPeriodInMs: function() {
        return new Date().getTime() - this.postDate() + this.postPeriod()
    },
    
    postPeriodDayCount: function() {
        return Math.floor(this.postPeriod() / (24 * 60 * 60 * 1000));
    },
    
    cancelSend: function() {
        
    },
    
    onDropFiles: function(filePaths) {
        let parts = []
    },
    
    placeInPathString: function(pathString) {
        let rootNode = App.shared()
        let pathComponents = pathString.split("/")
        let region = rootNode.nodeAtSubpath(pathComponents)
        if (region) {
            //console.log("inserting post " + this.hash() + " into region path " + pathString + " ", this.postDict().title)
            if (!region.containsSubnode(this)) {
                region.this.addSubnode(this)
            } else {
                console.log("can't insert duplicate subnode")
            }
        } else {
            let error = "missing region for path '" + pathString + "'"
            console.log("-----------\n".repeat(3) + "WARNING: " + error + "\n" + "-----------\n".repeat(3))
            //throw new Error(error)
        }
    },
    
    placeInRegion: function() {
        this.placeInPathString(this.path())
        return this
    },
    
    placeInAll: function() {
        this.placeInPathString("Classifieds/All")
        return this
    },
    
    isEqual: function(aPost) {
        return this.hash() === aPost.hash()
    },
    
    hash: function() {
        return Object.toStableHash(this.postDict())
    },
    
    incrementPowTarget: function() {
        //console.log("Post incrementPowTarget")
        this.prepareToSend() // shouldn't need this if there's a default BMPow hash
        this.powObj().incrementDifficulty()
        this.didUpdateNode()
    },
    
    decrementPowTarget: function() {
        //console.log("Post decrementPowTarget")
        this.prepareToSend() // shouldn't need this if there's a default BMPow hash
        this.powObj().decrementDifficulty()
        this.didUpdateNode()
    },
    
    powDifficulty: function() {
        return this.powObj().targetDifficulty()
    },
    
    compare: function(other) {
        let d1 = this.powObj().actualPowDifficulty()
        let d2 = other.powObj().actualPowDifficulty()
        let p1 = this.postDate()
        let p2 = other.postDate()
        
        let c = d1 - d2
        if (c === 0) { 
            c = p1 - p2;
        }
        
        return c;
    },

    fillWithTestData: function() {
        this.setTitle("".loremIpsum(2, 5))
        this.setDescription("".loremIpsum(20, 200))
        this.setPrice(Math.floor(Math.random()*100)/2)
    },

})
