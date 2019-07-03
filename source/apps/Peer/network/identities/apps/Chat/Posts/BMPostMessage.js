"use strict"

/*

    BMPostMessage

*/

window.BMPostMessage = BMAppMessage.extend().newSlots({
    type: "BMPostMessage",
    content: "",
	
    replyCount: 0,
    repostCount: 0,
    likeCount: 0,

    didReply: false,
    didRepost: false,
    didLike: false,
	
    postThread: null,
}).setSlots({
    
    init: function () {
        BMAppMessage.init.apply(this)
        this.addStoredSlots(["content", "hasRead", "replyCount", "repostCount", "likeCount"])
        this.setCanDelete(true)
        this.setShouldStore(true)	
        this.setContent("...".loremIpsum(4, 100))	
        this.customizeNodeRowStyles().setToBlackOnWhite()
    },

    /*
	senderId: function() {
		if (this._senderId) {
			return this._senderId
		}
		
        if (this.localIdentity() && this.objMsg()) {
			return this.localIdentity().idForPublicKeyString(this.objMsg().senderPublicKeyString())
		}
		
		return null
	},
	*/
    
    senderName: function() {
        if (this.senderId()) {
            return this.senderId().title()
        }
        
        if (this.objMsg()) {
            return this.objMsg().senderPublicKeyString()
        }
        
        return "?"
    },
    
    ageDescription: function() {
        return TimePeriodFormatter.clone().setValueInSeconds(this.ageInSeconds()).formattedValue()
    },
    
    ageInSeconds: function() {
        if (this.objMsg()) {
            return this.objMsg().ageInSeconds()
        }
        return 0
    },

    mostRecentDate: function() {
        return 0
    },
	
    title: function() {
	    return this.content()
    },
	
    wasSentByMe: function() {
        return this.senderId() === this.localIdentity()
    },
	
    contentDict: function() {
        const contentDict = {}
        contentDict.content = this.content()
        return contentDict
    },
	
    setContentDict: function(contentDict) {
        this.setContent(contentDict.content)
        //this.scheduleSyncToView()
        return this
    },
	
    description: function() {
        return this.typeId() + "-" + this.hash() + "'" + this.content() + "'"
    },

    localIdentity: function() {
        return this.parentNodeOfType("BMLocalIdentity")
    },
    
    localIdentityIsSender: function() {
        return this.senderId().equals(this.localIdentity())
    },
	
    avatarImageDataURL: function() {
        if (this.senderId()) {
            return this.senderId().profile().profileImageDataUrl()
        }
        return null
    },
	
    // counts
	
    incrementReplyCount: function() {
        this.setReplyCount(this.replyCount() + 1)
        return this
    },
    
    incrementRepostCount: function() {
        this.setRepostCount(this.repostCount() + 1)
        return this
    },
    
    incrementLikeCount: function() {
        this.setLikeCount(this.likeCount() + 1)
        return this
    },
    
    // link
    
    nodeRowLink: function() {
        if (this._nodeRowLink) {
            return this._nodeRowLink
        }
        
        return this.postNodeRowLink()
    },
    
    avatarNodeRowLink: function() {
        return this.senderId().profile()
    },
    
    postNodeRowLink: function() {
        return this.postThread()
    },
    
    postThread: function() {
        if (this._postThread == null) {
            this._postThread = BMPostThread.clone().setPostMessage(this).update()
        }
        return this._postThread
    },

    // replies
    
    replies: function() {
        if (this._replies == null) {
            this._replies = []
        }
        
        return this._replies
    },
})

