"use strict"

window.BMPostMessageRowView = BrowserRow.extend().newSlots({
    type: "BMPostMessageRowView",
    leftView: null,
	    iconView: null,
    middleView: null,
	    titleBarView: null,
	        titleBarTextView: null,
	        dateView: null,
        textView: null,
        bottomBarView: null,
            replyButton: null,
            replyCountView: null,
            
            repostButton: null,
            repostCountView: null,
            
            likeButton: null,
            likeCountView: null,
        //rightView: null,
    isSelected: false,
}).setSlots({
    init: function () {
        BrowserRow.init.apply(this)
        
        // left view
        this.setLeftView(this.addSubview(DivView.clone().setDivClassName("BMPostMessageRowLeftView")))
		this.setIconView(this.leftView().addSubview(ImageView.clone().setDivClassName("BMPostAvatarView")))
        this.iconView().setBackgroundSizeWH(64, 64)     

        // middle view
        this.setMiddleView(this.addSubview(DivView.clone().setDivClassName("BMPostMessageRowMiddleView")))
        
            // title view
    		this.setTitleBarView(this.middleView().addSubview(DivView.clone().setDivClassName("BMPostTitleBarView")))
    		
    		this.setTitleBarTextView(this.titleBarView().addSubview(DivView.clone().setDivClassName("BMPostTitleBarTextView")))
		    this.setDateView(this.titleBarView().addSubview(DivView.clone().setDivClassName("BMPostDateView")))
		
		    // content
            this.setTextView(this.middleView().addSubview(TextField.clone().setDivClassName("BMPostMessageRowViewContent")))
        
            // bottom bar
            this.setBottomBarView(this.middleView().addSubview(DivView.clone().setDivClassName("BMPostMessageRowViewBottomBar")))
        
                // reply
                this.setReplyButton(this.bottomBarView().addSubview(DivView.clone().setDivClassName("BMPostMessageRowViewReplyButton")))
                this.replyButton().setTarget(this).setAction("reply")
                this.replyButton().setBackgroundImageUrlPath(this.pathForIconName("reply"))        
        		this.replyButton().makeBackgroundContain().makeBackgroundNoRepeat()
        		this.setReplyCountView(this.bottomBarView().addSubview(DivView.clone().setDivClassName("BMPostMessageRowViewCountView")))
        
                // repost
                this.setRepostButton(this.bottomBarView().addSubview(DivView.clone().setDivClassName("BMPostMessageRowViewRepostButton")))
                this.repostButton().setTarget(this).setAction("repost")
                this.repostButton().setBackgroundImageUrlPath(this.pathForIconName("repost"))        
        		this.repostButton().makeBackgroundContain().makeBackgroundNoRepeat()
        		this.setRepostCountView(this.bottomBarView().addSubview(DivView.clone().setDivClassName("BMPostMessageRowViewCountView")))

                // like
                this.setLikeButton(this.bottomBarView().addSubview(DivView.clone().setDivClassName("BMPostMessageRowViewLikeButton")))
                this.likeButton().setTarget(this).setAction("like")
                this.likeButton().setBackgroundImageUrlPath(this.pathForIconName("heart-black-filled"))        
        		this.likeButton().makeBackgroundContain().makeBackgroundNoRepeat()
        		this.setLikeCountView(this.bottomBarView().addSubview(DivView.clone().setDivClassName("BMPostMessageRowViewCountView")))

        // right view
        //this.setRightView(this.addSubview(DivView.clone().setDivClassName("BMPostMessageRowRightView")))
        
        
		this.setupContentView()
		this.updateSubviews()
		this.setIsSelectable(true)
        return this
    },

    /*
	setupIconView: function() {
		var iv = DivView.clone().setDivClassName("ShelfIconView")
		this.setIconView(iv)
        this.leftView().addSubview(iv)
        
        var iconSize = 46
        iv.setPosition("relative")
        iv.setLeft((itemSize-iconSize)/2)
        iv.setTop((itemSize-iconSize)/2)
		iv.setMinAndMaxWidth(iconSize)
		iv.setMinAndMaxHeight(iconSize)
		iv.makeBackgroundNoRepeat()
		//this.makeBackgroundContain()
		iv.makeBackgroundCentered()
		iv.setBackgroundColor("transparent")
		iv.setOpacity(1)
        return this
    },
    */
   
    setIconDataUrl: function(imageDataUrl) {
        var iv = this.iconView()
        
        if (imageDataUrl) {
    		iv.setBackgroundImageUrlPath(imageDataUrl)        
        } else {
            iv.setBackgroundColor("#aaa")
        }
        
		return this
	},

    setupContentView: function() {
		var tv = this.textView()
		tv.setMinWidth("50px")
		//tv.setPosition("relative")
		tv.setMarginRight(0)
		tv.setMarginLeft(0)
		tv.setPaddingTop(0)
		tv.setPaddingBottom(4)
		tv.setWhiteSpace("normal")
		tv.setFontFamily("AppRegular")
    },

    showButtonNamed: function(name) {
        // TODO: abstract this into something like a PostAttributeButton 
        var node = this.node()
        var countView = this.perform(name + "CountView")
        var button = this.perform(name + "Button")
        var count = node.perform(name + "Count")
        var did = node.perform("did" + name.capitalized())
        
        if (count) {
            countView.setInnerHTML(count)
        } else {
            countView.setInnerHTML("")
        }
        
        if (did) {
            countView.setOpacity(1)
            button.setOpacity(1) 
        } else {
            countView.setOpacity(0.5)
            button.setOpacity(0.5) 
        }
    },
        
    updateSubviews: function() {
		BrowserRow.updateSubviews.apply(this)
	
        var node = this.node()

        if (node) {
            this.titleBarTextView().setInnerHTML(node.localIdentity().title())
            this.dateView().setInnerHTML(node.ageDescription())
            
            console.log("----")
            this.showButtonNamed("reply")
            this.showButtonNamed("repost")
            this.showButtonNamed("like")
            
        } else {
            this.titleBarTextView().setInnerHTML("[no node]")
        }
        
        
		if (this.isSelected()) {
			this.setColor(this.selectedTextColor())
		} else {
			this.setColor(this.unselectedTextColor())
		}
		
        return this
    },

	// --- text color ---
	
    unselectedBgColor: function() {
        return "white"
    },
    
    selectedBgColor: function() {
        return "white"
    },

	selectedTextColor: function() {
		return "black"
	},
	
	unselectedTextColor: function() {
		return "black"
	},

    // --- edit ---

    onDidEdit: function (changedView) {   
        console.log(this.typeId() + ".onDidEdit")
        this.scheduleSyncToNode()
    },

	didInput: function() {
        this.scheduleSyncToNode() //this.syncToNode()
	},

    // --- sync ---

    syncToNode: function () {   
        //console.log("syncToNode")
        this.node().setContent(this.textView().innerHTML())
        this.node().tellParentNodes("onDidEditNode", this.node())  
        this.node().scheduleSyncToStore()
        return this
    },

    syncFromNode: function () {
        var node = this.node()
		this.setIconDataUrl(node.avatarImageDataURL())
        this.textView().setString(node.content())
        this.updateSubviews()
        return this
    },
    
    // actions
    
    reply: function() {
        console.log("reply")
        this.node().incrementReplyCount()
        this.scheduleSyncToNode()
        return this
    },
    
    repost: function() {
        console.log("repost")
        this.node().incrementRepostCount()
        this.scheduleSyncToNode()
        return this
    },
    
    like: function() {
        console.log("like")
        this.node().incrementLikeCount()
        this.scheduleSyncToNode()
        return this
    },

})
