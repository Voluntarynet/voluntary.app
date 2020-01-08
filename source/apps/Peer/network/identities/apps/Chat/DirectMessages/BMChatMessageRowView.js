"use strict"

/*

    BMChatMessageRowView

*/

window.BMChatMessageRowView = class BMChatMessageRowView extends BrowserTitledRow {
    
    initPrototype () {

    }

    init () {
        super.init()
        //	this.setSelectedBgColor("white")
        //	this.setUnselectedBgColor("white")

        this.setDisplay("block")
		
        this.setMinHeight("auto")
        this.setMaxHeightPx(1000)
        this.setHeight("auto")
		
        this.setPaddingTop(10)
        this.setMarginBottom(10)
		
        this.setupTitleView()
    }
    
    setupTitleView () {
        this.titleView().insertDivClassName(this.type() + "Title")
        this.titleView().setWidth("auto")
        this.titleView().setMinWidth("50px")
        this.titleView().setMaxWidth("calc(100% - 100px)")

        this.titleView().setTop(0)
        this.titleView().setPosition("relative")
        this.titleView().setLeft(null)
        this.titleView().setMarginRight(20)
        this.titleView().setMarginLeft(0)
        //this.titleView().setBorder("1px solid rgba(0,0,0,0.05)")
    }
    
    alignToRight () {
	    this.titleView().setRight(20)
        this.titleView().setFloat("right")
	    this.titleView().setBorderRadius("8px 8px 0px 8px") // top-left, top-right,  bottom-right, bottom-left
        this.titleView().setBackgroundColor("rgb(84, 193, 250)")
        this.titleView().setColor("white")
        //this.titleView().setBorder("1px solid rgba(0,0,0,0.02)")
	    return this
    }
    
    alignToLeft () {
        this.titleView().setLeft(20)
    	this.titleView().setFloat("left")
        this.titleView().setBorderRadius("8px 8px 8px 0px") // top-left, top-right,  bottom-right, bottom-left 
        this.titleView().setBackgroundColor("#ccc")
        this.titleView().setColor("black")
	    return this
    }

    setHasSubtitle (aBool) {        
        // so it doesn't adjust title 
        return this
    }

    message () {
        return this.node()
    }

    updateSubviews () {
        super.updateSubviews()
		
        const node = this.node()
        if (node) {
            //this.debugLog(" updateSubviews node = " + node.typeId() + " content = ", this.node().content())
            this.titleView().setInnerHTML(node.title())
		
            if (this.message().wasSentByMe()) {
                this.styleAsSent()
            } else {
                this.styleAsReceived()
            }
        }
		
        return this
    }
	
    styleAsSent () {
        this.alignToRight()
    }
	
    styleAsReceived () {
        this.alignToLeft()
    }
    
    /*
    unselectedBgColor () {
        return "white"
    }
    
    selectedBgColor () {
        return "white"
    }
    */

}.initThisClass()

