
"use strict"

window.BMTwitter = BMApplet.extend().newSlots({
    type: "BMTwitter",
    feed: null,
    notifications: null,
    messages: null,
    profile: null,
    following: null,
    followers: null,
}).setSlots({
    init: function () {
        BMApplet.init.apply(this)
        this.setTitle("Twitter")
        
        this.setFeed(BMNode.clone())
        this.addSubnode(this.feed().setTitle("feed"))
                
		this.setNotifications(BMNode.clone().setTitle("notifications"))
        this.addSubnode(this.notifications())

		this.setMessages(BMNode.clone().setTitle("direct messages"))
        this.addSubnode(this.messages())
        
		this.setProfile(BMNode.clone().setTitle("profile"))
        this.addSubnode(this.profile())

		this.setFollowing(BMNode.clone().setTitle("following"))
        this.addSubnode(this.following())
        
		this.setFollowers(BMNode.clone().setTitle("followers"))
        this.addSubnode(this.followers())
    },
    
    handleMessage: function(twitterMessage) {
        
        
    },
})

