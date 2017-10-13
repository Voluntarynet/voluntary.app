

"use strict"

window.BMPostMessageRowView = BrowserRow.extend().newSlots({
    type: "BMPostMessageRowView",
	imageView: null,
    textView: null,
    isSelected: false,
}).setSlots({
    init: function () {
        BrowserRow.init.apply(this)
		this.setImageView(this.addSubview(ImageView.clone().setDivClassName("BMPostAvatarView")))
		var iv = this.imageView()
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

    setupContentView: function() {
		var tv = this.textView()
		tv.insertDivClassName(this.type() + "Title")
		tv.setWidth("auto")
		tv.setMinWidth("50px")
		tv.setMaxWidth("calc(100% - 120px)")

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
		this.imageView().setFromDataURL(node.avatarImageDataURL())
        this.textView().setString(node.content())
        this.updateSubviews()
        return this
    },
})


