

"use strict"

window.BMPostDraftRowView = BrowserRow.extend().newSlots({
    type: "BMPostDraftRowView",
    topView: null,
    bottomView: null,

    leftView: null,
        iconView: null,
    rightView: null,
        contentView: null,
    isSelected: false,
}).setSlots({
    init: function () {
        BrowserRow.init.apply(this)
        
        // left view
        this.setLeftView(this.addSubview(DivView.clone().setDivClassName("BMPostDraftRowLeftView")))

            // icon view
		    this.setIconView(this.leftView().addSubview(ImageView.clone().setDivClassName("BMPostAvatarView")))
            this.iconView().setBackgroundSizeWH(64, 64)     

        // right view
        this.setRightView(this.addSubview(DivView.clone().setDivClassName("BMPostDraftRowRightView")))
        
            this.setContentView(this.rightView().addSubview(TextField.clone().setDivClassName("BMPostDraftRowContentView")))
            this.contentView().setContentEditable(true)

            //this.setToolsView(this.rightView().addSubview(TextField.clone().setDivClassName("BMPostDraftRowContentView")))

            //BMPostDraftRowToolsView
        
		this.setupContentView()
		this.updateSubviews()
		this.setIsSelectable(true)
		
        return this
    },

    setupContentView: function() {
		var tv = this.contentView()
		tv.insertDivClassName(this.type() + "Title")
		//tv.setWidth("auto")

		tv.setPosition("relative")
		tv.setMarginRight(0)
		tv.setMarginLeft(0)
		this.setPaddingBottom(0)
		tv.setWhiteSpace("normal")
		tv.setFontFamily("AppRegular")        
    },
    
    setIconDataUrl: function(imageDataUrl) {
        var iv = this.iconView()
        
        if (imageDataUrl) {
    		iv.setBackgroundImageUrlPath(imageDataUrl)        
        } else {
            iv.setBackgroundColor("#aaa")
        }
        
		return this
	},

    updateSubviews: function() {
		BrowserRow.updateSubviews.apply(this)
	
        var node = this.node()
        
        if (node) {
            
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
        return "rgba(255, 255, 255, 0.5)"
    },
    
    selectedBgColor: function() {
        return "rgba(0, 0, 0, 0.05)"
    },

	selectedTextColor: function() {
		return "black"
	},
	
	unselectedTextColor: function() {
		return "rgba(0, 0, 0, 0.5)"
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
        this.node().setContent(this.contentView().innerHTML())
        this.node().tellParentNodes("onDidEditNode", this.node())  
        this.node().scheduleSyncToStore()
        return this
    },

    syncFromNode: function () {
        var node = this.node()
        this.contentView().setString(node.content())
		this.setIconDataUrl(node.avatarImageDataURL())
        this.updateSubviews()
        return this
    },
})