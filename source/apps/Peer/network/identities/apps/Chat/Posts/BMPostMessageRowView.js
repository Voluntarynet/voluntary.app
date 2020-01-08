"use strict"

/*

    BMPostMessageRowView

*/

window.BMPostMessageRowView = class BMPostMessageRowView extends BrowserRow {
    
    initPrototype () {
        this.newSlot("leftView", null)
        this.newSlot("iconView", null)
        this.newSlot("middleView", null)
        this.newSlot("titleBarView", null)
        this.newSlot("titleBarTextView", null)
        this.newSlot("dateView", null)
        this.newSlot("textView", null)
        this.newSlot("bottomBarView", null)
        this.newSlot("replyButton", null)
        this.newSlot("replyCountView", null)
        this.newSlot("repostButton", null)
        this.newSlot("repostCountView", null)
        this.newSlot("likeButton", null)
        this.newSlot("likeCountView", null)
        //rightView: null,
    }

    init () {
        super.init()

        this.setMinHeightPx(100)
        //this.contentView()

        // left view
        this.setLeftView(this.addContentSubview(DomView.clone().setDivClassName("BMPostMessageRowLeftView")))
        this.setIconView(this.leftView().addSubview(ImageView.clone().setDivClassName("BMPostAvatarView")))
        this.iconView().setBackgroundSizeWH(64, 64).setTarget(this).setAction("clickedIconView")

        // middle view
        this.setMiddleView(this.addContentSubview(DomView.clone().setDivClassName("BMPostMessageRowMiddleView")))

        // title view
        this.setTitleBarView(this.middleView().addSubview(DomView.clone().setDivClassName("BMPostTitleBarView")))

        this.setTitleBarTextView(this.titleBarView().addSubview(DomView.clone().setDivClassName("BMPostTitleBarTextView")))
        this.setDateView(this.titleBarView().addSubview(DomView.clone().setDivClassName("BMPostDateView")))

        // content
        this.setTextView(this.middleView().addSubview(TextField.clone().setDivClassName("BMPostMessageRowViewContent")))

        // bottom bar
        this.setBottomBarView(this.middleView().addSubview(DomView.clone().setDivClassName("BMPostMessageRowViewBottomBar")))

        // reply
        this.setReplyButton(this.bottomBarView().addSubview(DomView.clone().setDivClassName("BMPostMessageRowViewReplyButton")))
        this.replyButton().setTarget(this).setAction("reply")
        this.replyButton().setBackgroundImageUrlPath(this.pathForIconName("reply"))
        this.replyButton().makeBackgroundContain().makeBackgroundNoRepeat()
        this.replyButton().setToolTip("reply")
        this.setReplyCountView(this.bottomBarView().addSubview(DomView.clone().setDivClassName("BMPostMessageRowViewCountView")))

        // repost
        this.setRepostButton(this.bottomBarView().addSubview(DomView.clone().setDivClassName("BMPostMessageRowViewRepostButton")))
        this.repostButton().setTarget(this).setAction("repost")
        this.repostButton().setBackgroundImageUrlPath(this.pathForIconName("repost"))
        this.repostButton().makeBackgroundContain().makeBackgroundNoRepeat()
        this.repostButton().setToolTip("repost")
        this.setRepostCountView(this.bottomBarView().addSubview(DomView.clone().setDivClassName("BMPostMessageRowViewCountView")))

        // like
        this.setLikeButton(this.bottomBarView().addSubview(DomView.clone().setDivClassName("BMPostMessageRowViewLikeButton")))
        this.likeButton().setTarget(this).setAction("like")
        this.likeButton().setBackgroundImageUrlPath(this.pathForIconName("heart-black-filled"))
        this.likeButton().makeBackgroundContain().makeBackgroundNoRepeat()
        this.likeButton().setToolTip("like")
        this.setLikeCountView(this.bottomBarView().addSubview(DomView.clone().setDivClassName("BMPostMessageRowViewCountView")))

        // right view
        //this.setRightView(this.addContentSubview(DomView.clone().setDivClassName("BMPostMessageRowRightView")))


        this.setupContentView()
        this.updateSubviews()
        this.setIsSelectable(true)

        //this.styles().setToBlackOnWhite()		
        // console.log(" =======> " + this.typeId() + " this.styles().selected().backgroundColor() = ", this.styles().selected().backgroundColor())

        return this
    }

    clickedIconView () {
        console.log("clickedIconView")
        return this
    }

    addCloseButton () {
        // avoid adding normal BrowserRow closeButtonView
        return this
    }

    setParentView (aView) {
        // what is this for?
        super.setParentView(aView)
        this.registerForVisibility()
        return this
    }

    /*
	setupIconView () {
		let iv = DomView.clone().setDivClassName("ShelfIconView")
		this.setIconView(iv)
        this.leftView().addSubview(iv)
        
        let iconSize = 46
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
    }
    */

    setIconDataUrl (imageDataUrl) {
        let iv = this.iconView()

        if (imageDataUrl) {
            iv.setBackgroundImageUrlPath(imageDataUrl)
        } else {
            iv.setBackgroundColor("#aaa")
        }

        return this
    }

    setupContentView () {
        let tv = this.textView()
        tv.setMinWidth(50)
        //tv.setPosition("relative")
        tv.setMarginRight(0)
        tv.setMarginLeft(0)
        tv.setPaddingTop(0)
        tv.setPaddingBottom(4)
        tv.setWhiteSpace("normal")
        tv.setFontFamily("AppRegular, Sans-Serif")
    }

    showButtonNamed (name) {
        // TODO: abstract this into something like a PostAttributeButton 
        let node = this.node()
        let countView = this.perform(name + "CountView")
        let button = this.perform(name + "Button")
        let count = node.perform(name + "Count")
        let did = node.perform("did" + name.capitalized())

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
    }

    updateSubviews () {
        super.updateSubviews()

        let node = this.node()

        if (node) {
            this.titleBarTextView().setInnerHTML(node.senderName())
            this.dateView().setInnerHTML(node.ageDescription())

            this.showButtonNamed("reply")
            this.showButtonNamed("repost")
            this.showButtonNamed("like")

        } else {
            this.titleBarTextView().setInnerHTML("[no node]")
        }

        return this
    }

    // --- edit ---

    /*
    onDidEdit (changedView) {
        this.debugLog(".onDidEdit")
        this.scheduleSyncToNode()
        return true
    }
    */

    didInput () {
        this.scheduleSyncToNode() //this.syncToNode()
    }

    // --- sync ---

    syncToNode () {
        //console.log("syncToNode")
        this.node().setContent(this.textView().innerHTML())
        //his.node().tellParentNodes("onDidEditNode", this.node())
        this.node().scheduleSyncToStore() // TODO: this should be handled by the node
        return this
    }

    syncFromNode () {
        let node = this.node()
        this.setIconDataUrl(node.avatarImageDataURL())
        this.textView().setString(node.content())
        this.updateSubviews()
        return this
    }

    // actions

    reply () {
        console.log("reply")
        this.node().incrementReplyCount()
        this.scheduleSyncToNode()
        return this
    }

    repost () {
        console.log("repost")
        this.node().incrementRepostCount()
        this.scheduleSyncToNode()
        return this
    }

    like () {
        console.log("like")
        this.node().incrementLikeCount()
        this.scheduleSyncToNode()
        return this
    }

}.initThisClass()
