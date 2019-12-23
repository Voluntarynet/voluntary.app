"use strict"

/*

    BMPostMessage

*/


window.BMPostMessage = class BMPostMessage extends BMAppMessage {
    
    initPrototype () {

        this.newSlot("content", null).setShouldStoreSlot(true)
        this.overrideSlot("hasRead", false).setShouldStoreSlot(true)
        this.newSlot("replyCount", 0).setShouldStoreSlot(true)
        this.newSlot("repostCount", 0).setShouldStoreSlot(true)
        this.newSlot("likeCount", 0).setShouldStoreSlot(true)

        this.newSlot("didReply", false).setShouldStoreSlot(true)
        this.newSlot("didRepost", false).setShouldStoreSlot(true)
        this.newSlot("didLike", false).setShouldStoreSlot(true)
        this.newSlot("postThread", null).setShouldStoreSlot(true)
        this.setCanDelete(true)
        this.setShouldStore(true)	
    }

    init () {
        super.init()
        this.setContent("...".loremIpsum(4, 100))	
        this.customizeNodeRowStyles().setToBlackOnWhite()
    }

    /*
	senderId () {
		if (this._senderId) {
			return this._senderId
		}
		
        if (this.localIdentity() && this.objMsg()) {
			return this.localIdentity().idForPublicKeyString(this.objMsg().senderPublicKeyString())
		}
		
		return null
	},
	*/
    
    senderName () {
        if (this.senderId()) {
            return this.senderId().title()
        }
        
        if (this.objMsg()) {
            return this.objMsg().senderPublicKeyString()
        }
        
        return "?"
    }
    
    ageDescription () {
        return TimePeriodFormatter.clone().setValueInSeconds(this.ageInSeconds()).formattedValue()
    }
    
    ageInSeconds () {
        if (this.objMsg()) {
            return this.objMsg().ageInSeconds()
        }
        return 0
    }

    mostRecentDate () {
        return 0
    }
	
    title () {
	    return this.content()
    }
	
    wasSentByMe () {
        return this.senderId() === this.localIdentity()
    }
	
    contentDict () {
        const contentDict = {}
        contentDict.content = this.content()
        return contentDict
    }
	
    setContentDict (contentDict) {
        this.setContent(contentDict.content)
        //this.scheduleSyncToView()
        return this
    }
	
    description () {
        return this.typeId() + "-" + this.hash() + "'" + this.content() + "'"
    }

    localIdentity () {
        return this.parentNodeOfType("BMLocalIdentity")
    }
    
    localIdentityIsSender () {
        return this.senderId().equals(this.localIdentity())
    }
	
    avatarImageDataURL () {
        if (this.senderId()) {
            return this.senderId().profile().profileImageDataUrl()
        }
        return null
    }
	
    // counts
	
    incrementReplyCount () {
        this.setReplyCount(this.replyCount() + 1)
        return this
    }
    
    incrementRepostCount () {
        this.setRepostCount(this.repostCount() + 1)
        return this
    }
    
    incrementLikeCount () {
        this.setLikeCount(this.likeCount() + 1)
        return this
    }
    
    // link
    
    nodeRowLink () {
        if (this._nodeRowLink) {
            return this._nodeRowLink
        }
        
        return this.postNodeRowLink()
    }
    
    avatarNodeRowLink () {
        return this.senderId().profile()
    }
    
    postNodeRowLink () {
        return this.postThread()
    }
    
    postThread () {
        if (this._postThread === null) {
            this._postThread = BMPostThread.clone().setPostMessage(this).update()
        }
        return this._postThread
    }

    // replies
    
    replies () {
        if (this._replies === null) {
            this._replies = []
        }
        
        return this._replies
    }
    
}.initThisClass()

