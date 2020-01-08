"use strict"

/*

    BMPostDraftRowView



*/

window.BMPostDraftRowView = class BMPostDraftRowView extends BrowserRow {
    
    initPrototype () {

        this.newSlot("topView", null)
        this.newSlot("leftView", null)
        this.newSlot("iconView", null)
        this.newSlot("rightView", null)
        this.newSlot("placeHolderView", null)
        this.newSlot("textContentView", null)
        //deleteButton: null,
        this.newSlot("bottomView", null)
        this.newSlot("sendButton", null)
    }

    init () {
        this.setShouldCenterCloseButton(false) // hack, TODO: change this
        super.init()

        this.setHeight("auto")
        this.setMinHeight("fit-content")
        this.setMaxHeight("fit-content")

        // trying to avoid height animation but this isn't working
        this.setTransition("all 0.2s, height 0s")
        //this.contentView().setTransition("all 0.2s, height 0s")

        // ------------------------------------------
        
        this.contentView().setDisplay("block")
        this.contentView().setPosition("relative")
        this.contentView().setHeight("auto")
        this.contentView().setMinHeight("fit-content")
        this.contentView().setMaxHeight("fit-content")

        // --------------------------------------------------
        this.addCloseButton()
        
        this.closeButtonView().setDivClassName("BrowserRowCloseButtonTopRight")
        this.setTopView(this.addContentSubview(DomView.clone().setDivClassName("BMPostDraftRowTopView")))

        // left view
        this.setLeftView(this.topView().addSubview(DomView.clone().setDivClassName("BMPostDraftRowLeftView")))

        // icon view
    	this.setIconView(this.leftView().addSubview(ImageView.clone().setDivClassName("BMPostAvatarView")))
        this.iconView().setBackgroundSizeWH(64, 64)     

        // right view
        this.setRightView(this.topView().addSubview(DomView.clone().setDivClassName("BMPostDraftRowRightView")))
        

        // placeholder
        this.setPlaceHolderView(this.rightView().addSubview(TextField.clone().setDivClassName("BMPostDraftRowPlaceHolderView")))
        this.placeHolderView().setInnerHTML("What's happening?")
                
        // content view
        this.setTextContentView(this.rightView().addSubview(TextField.clone().setDivClassName("BMPostDraftRowContentView")))
        this.textContentView().setIsEditable(true)

        this.closeButtonView().setBackgroundImageUrlPath(this.pathForIconName("close"))
        this.closeButtonView().setTop(15).setRight(15).setMinAndMaxWidth(10).setMinAndMaxHeight(10)
        // delete button
        /*
        this.setDeleteButton(this.rightView().addSubview(DomView.clone().setDivClassName("BMPostDraftRowCloseButton")))
        this.deleteButton().setTarget(this).setAction("delete")
        //this.deleteButton().setBackgroundSizeWH(20, 20) 
        this.deleteButton().setBackgroundImageUrlPath(this.pathForIconName("close"))
        this.deleteButton().makeBackgroundContain().makeBackgroundCentered().makeBackgroundNoRepeat()  
        */  
        
        this.setBottomView(this.addContentSubview(DomView.clone().setDivClassName("BMPostDraftRowBottomView")))
        this.setSendButton(this.bottomView().addSubview(DomView.clone().setDivClassName("BMPostDraftRowSendButton")))
        this.sendButton().setInnerHTML("Post")
        this.sendButton().setTarget(this).setAction("post")

        this.setupTextContentView()
        this.updateSubviews()
        this.setIsSelectable(true)
		
        //this.styles().setToBlackOnWhite()

        this.closeButtonView().orderFront()

        //this.sendAllViewDecendants("setTransition", ["all 0s"])
				
        return this
    }

    setupTextContentView () {
        const tv = this.textContentView()
        tv.insertDivClassName(this.type() + "Title")
        //tv.setWidth("auto")
        tv.setPosition("relative")
        tv.setMarginRight(0)
        tv.setMarginLeft(0)
        this.setPaddingBottom(0)
        tv.setWhiteSpace("normal")
        tv.setFontFamily("AppRegular, Sans-Serif")       
        tv.setTransition("all 0s")
        return this
    }
    
    setIconDataUrl (imageDataUrl) {
        const iv = this.iconView()
        
        if (imageDataUrl) {
    		iv.setBackgroundImageUrlPath(imageDataUrl)        
        } else {
            iv.setBackgroundColor("#aaa")
        }
        
        return this
    }

    updateSubviews () {
        super.updateSubviews()
    
        const node = this.node()
        
        if (node && this.textContentView()) {
            /*
            const placeText = this.textContentView().innerHTML().length ? "" : "What's happening?"    
            this.placeHolderView().setInnerHTML(placeText)
            */

            const opacity = this.textContentView().innerHTML().length ? 0 : 1
            this.placeHolderView().setOpacity(opacity)
        }

        //this.sendAllViewDecendants("setTransition", ["all 0s"])

        return this
    }

    // --- edit ---

    onDidEdit (changedView) {   
        //this.debugLog(".onDidEdit")
        this.updateSubviews()
        this.scheduleSyncToNode()
        return true
    }

    didInput () {
        this.scheduleSyncToNode() //this.syncToNode()
    }

    // --- sync ---
    
    syncToNode () {   
        //console.log("syncToNode")
        this.node().setContent(this.textContentView().innerHTML())
        //this.node().tellParentNodes("onDidEditNode", this.node())  
        this.node().scheduleSyncToStore()
        return this
    }

    syncFromNode () {
        const node = this.node()
        this.textContentView().setString(node.content())
        this.setIconDataUrl(node.avatarImageDataURL())
        this.updateSubviews()
        return this
    }
    
    // actions
    
    post () {
        this.node().post()
        return this
    }
    
    /*
    delete () {
        this.sendAllViewDecendants("setTransition", ["all 0.2s"])
        setTimeout(() => { this.node().delete() })
        //this.delete()
        //this.node().delete()
        return this
    }
    */
   
}.initThisClass()

