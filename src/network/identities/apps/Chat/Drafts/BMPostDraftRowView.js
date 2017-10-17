

"use strict"

window.BMPostDraftRowView = BrowserRow.extend().newSlots({
    type: "BMPostDraftRowView",
    leftView: null,
    rightView: null,
    textView: null,
    isSelected: false,
}).setSlots({
    init: function () {
        BrowserRow.init.apply(this)
        
        this.setLeftView(this.addSubview(DivView.clone().setDivClassName("BMPostDraftRowLeftView")))
        this.setRightView(this.addSubview(DivView.clone().setDivClassName("BMPostDraftRowRightView")))
        
        var text = TextField.clone().setDivClassName("BMPostDraftRowTitleView").setContentEditable(true)
        this.setTextView(this.rightView().addSubview(text))
        
		this.setupContentView()
		this.updateSubviews()
		this.setIsSelectable(true)
		
		//this.setDisplay("flex")
        return this
    },

    setupContentView: function() {
		var tv = this.textView()
		tv.insertDivClassName(this.type() + "Title")
		tv.setWidth("auto")
		tv.setMinWidth("50px")
		tv.setMaxWidth("calc(100% - 120px)")

		tv.setPosition("relative")
		tv.setMarginRight(0)
		tv.setMarginLeft(0)
		this.setPaddingBottom(0)
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
        this.node().setContent(this.textView().innerHTML())
        this.node().tellParentNodes("onDidEditNode", this.node())  
        this.node().scheduleSyncToStore()
        return this
    },

    syncFromNode: function () {
        var node = this.node()
        this.textView().setString(node.content())
        this.updateSubviews()
        return this
    },
})




/*BrowserTitledRow.extend().newSlots({
    type: "BMPostDraftRowView",
}).setSlots({
    
    init: function () {
        BrowserTitledRow.init.apply(this)
	//	this.setSelectedBgColor("white")
	//	this.setUnselectedBgColor("white")

		this.setDisplay("block")
		
		this.setMinHeight("auto")
		this.setMaxHeight("1000px")
		this.setHeight("auto")
		
		this.setPaddingTop(10)
		this.setPaddingBottom(10)
		//this.setMarginBottom(10)
		
		this.setupTitleView()
    },
    
    setupTitleView: function() {
		var tv = this.titleView()
		tv.insertDivClassName(this.type() + "Title")
		tv.setWidth("auto")
		tv.setMinWidth("50px")
		tv.setMaxWidth("calc(100% - 100px)")

		tv.setTop(0)
		tv.setPosition("relative")
		tv.setLeft(null)
		tv.setMarginRight(20)
		tv.setMarginLeft(0)
		tv.setWhiteSpace("normal")
		tv.setFontFamily("AppRegular")
	    
    },

    setHasSubtitle: function(aBool) {        
		// so it doesn't adjust title 
        return this
    },

	message: function() {
		return this.node()
	},

    updateSubviews: function() {
		BrowserTitledRow.updateSubviews.apply(this)

		return this
	},
	
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
})

*/