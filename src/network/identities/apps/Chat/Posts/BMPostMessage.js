
"use strict"

window.BMPostMessage = BMAppMessage.extend().newSlots({
    type: "BMPostMessage",
	content: "",
	
	replyCount: 0,
	repostCount: 0,
	likeCount: 0,

	didReply: false,
	didRepost: false,
	didLike: false,

}).setSlots({
    
    init: function () {
        BMAppMessage.init.apply(this)
        this.addStoredSlots(["content", "replyCount", "repostCount", "likeCount"])
        this.addAction("delete")
        this.setShouldStore(true)	
		this.setContent("...".loremIpsum(4, 100))	
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
        var seconds = this.ageInSeconds()
        if (seconds == null) {
            return "?"
        }
        
        var minutes = Math.floor(seconds/60)
        if (minutes < 60) {
            return minutes + "m"
        }

        var hours = Math.floor(minutes/60)
        if (hours < 24) {
            return hours + "h"
        }
        
        var days = Math.floor(hours/24)
        return days + "d"
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
	
	nodeRowLink: function() {
		return null
	},
	
	title: function() {
	    return this.content()
	},
	
	wasSentByMe: function() {
		return this.senderId() === this.localIdentity()
	},
	
	contentDict: function() {
		var contentDict = {}
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
})

