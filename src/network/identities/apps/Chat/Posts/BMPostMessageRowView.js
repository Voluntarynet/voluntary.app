

"use strict"

window.BMPostMessageRowView = BrowserRow.extend().newSlots({
    type: "BMPostMessageRowView",
	titleBarView: null,
	iconView: null,
    textView: null,
    isSelected: false,
}).setSlots({
    init: function () {
        BrowserRow.init.apply(this)
		this.setTitleBarView(this.addSubview(DivView.clone().setDivClassName("BMPostTitleBarView")))
		this.setIconView(this.addSubview(ImageView.clone().setDivClassName("BMPostAvatarView")))
		//var iv = this.iconView()
		//iv.makeBackgroundNoRepeat()
		//this.makeBackgroundContain()
		//iv.makeBackgroundCentered()
		
        //this.setTextView(this.addSubview(TextField.clone().setDivClassName("BMPostDraftRowViewRowViewTitle")))
        this.setTextView(this.addSubview(TextField.clone()))
        this.textView().setContentEditable(true)
		this.setupContentView()
		this.updateSubviews()
		this.setIsSelectable(true)
        return this
    },


	setupIconView: function() {
		var iv = DivView.clone().setDivClassName("ShelfIconView")
		this.setIconView(iv)
        this.addSubview(iv)
        
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
   
    setIconDataUrl: function(imageDataUrl) {
        var iv = this.iconView()
        
        if (imageDataUrl) {
    		iv.setBackgroundImageUrlPath(imageDataUrl)        
    		iv.setBackgroundSizeWH(64, 64)     
        } else {
            iv.setBackgroundColor("#aaa")
        }
        
		return this
	},

    setupContentView: function() {
		var tv = this.textView()
		tv.insertDivClassName(this.type() + "Title")
		tv.setWidth("auto")
		tv.setMinWidth("50px")
		//tv.setMaxWidth("calc(100% - 120px)")

		//tv.setTop(0)
		tv.setPosition("relative")
		tv.setLeft(80)
		tv.setMarginRight(0)
		tv.setMarginLeft(0)
		tv.setPaddingTop(8)
		tv.setPaddingBottom(8)
		tv.setWhiteSpace("normal")
		tv.setFontFamily("AppRegular")
    },

    updateSubviews: function() {
		BrowserRow.updateSubviews.apply(this)
	
        var node = this.node()

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
})


