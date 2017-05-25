
BMTwitter = BMApplet.extend().newSlots({
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
        this.addItem(this.feed().setTitle("feed"))
        
		this.setNotifications(BMNode.clone().setTitle("notifications"))
        this.addItem(this.notifications())

		this.setMessages(BMNode.clone().setTitle("messages"))
        this.addItem(this.messages())
        
		this.setProfile(BMNode.clone().setTitle("profile"))
        this.addItem(this.profile())

		this.setFollowing(BMNode.clone().setTitle("following"))
        this.addItem(this.following())
        
		this.setFollowers(BMNode.clone().setTitle("followers"))
        this.addItem(this.followers())
    },
    
    handleMessage: function(twitterMessage) {
        
        
    },
})

