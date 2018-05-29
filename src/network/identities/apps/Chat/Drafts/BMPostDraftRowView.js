

"use strict"

window.BMPostDraftRowView = BrowserRow.extend().newSlots({
    type: "BMPostDraftRowView",
    
    topView: null,
    leftView: null,
    iconView: null,
    rightView: null,
    placeHolderView: null,
    contentView: null,
    deleteButton: null,

    bottomView: null,
    sendButton: null,
        
    isSelected: false,
}).setSlots({
    init: function () {
        BrowserRow.init.apply(this)
        
        this.setTopView(this.addSubview(DivView.clone().setDivClassName("BMPostDraftRowTopView")))

        // left view
        this.setLeftView(this.topView().addSubview(DivView.clone().setDivClassName("BMPostDraftRowLeftView")))

        // icon view
    		    this.setIconView(this.leftView().addSubview(ImageView.clone().setDivClassName("BMPostAvatarView")))
        this.iconView().setBackgroundSizeWH(64, 64)     

        // right view
        this.setRightView(this.topView().addSubview(DivView.clone().setDivClassName("BMPostDraftRowRightView")))
        
        // placeholder
        this.setPlaceHolderView(this.rightView().addSubview(TextField.clone().setDivClassName("BMPostDraftRowPlaceHolderView")))
        this.placeHolderView().setInnerHTML("What's happening?")
                
        // content view
        this.setContentView(this.rightView().addSubview(TextField.clone().setDivClassName("BMPostDraftRowContentView")))
        this.contentView().setContentEditable(true)

        // delete button
        this.setDeleteButton(this.rightView().addSubview(DivView.clone().setDivClassName("BMPostDraftRowCloseButton")))
        this.deleteButton().setTarget(this).setAction("delete")
        //this.deleteButton().setBackgroundSizeWH(20, 20) 
        this.deleteButton().setBackgroundImageUrlPath(this.pathForIconName("close"))
        this.deleteButton().makeBackgroundContain().makeBackgroundCentered().makeBackgroundNoRepeat()    
        
        this.setBottomView(this.addSubview(DivView.clone().setDivClassName("BMPostDraftRowBottomView")))
        this.setSendButton(this.bottomView().addSubview(DivView.clone().setDivClassName("BMPostDraftRowSendButton")))
        this.sendButton().setInnerHTML("Post")
        this.sendButton().setTarget(this).setAction("post")

        this.setupContentView()
        this.updateSubviews()
        this.setIsSelectable(true)
		
        //        this.styles().setToBlackOnWhite()

				
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
            /*
            var placeText = this.contentView().innerHTML().length ? "" : "What's happening?"    
            this.placeHolderView().setInnerHTML(placeText)
*/
            var opacity = this.contentView().innerHTML().length ? 0 : 1
            this.placeHolderView().setOpacity(opacity)
        }

		
        return this
    },

    // --- edit ---

    onDidEdit: function (changedView) {   
        console.log(this.typeId() + ".onDidEdit")
        this.updateSubviews()
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
    
    // actions
    
    post: function() {
        this.node().post()
        return this
    },
    
    close: function() {
        this.node().delete()
        return this
    },
})

