
BMClassifiedPostView = NodeView.extend().newSlots({
    type: "BMPostView",
    statusView: null,
    titleView: null,

    // price
    priceContainerView: null,
    priceView: null,
    currencyView: null,

    // stamp
    powContainerView: null,
    powView: null,
    powIncrementView: null,
    powDecrementView: null,    
    
    timeView:null,
    

    
    descriptionView: null,
    
    // post
    buttonView: null,

}).setSlots({
    init: function () {
        NodeView.init.apply(this)
        
        this.setDivClassName("BMPostView")
        
        this.setStatusView(NodeView.clone().setDivClassName("BMPostStatusView"))
        this.addItem(this.statusView())

        this.setPriceContainerView(NodeView.clone().setDivClassName("BMPostPriceContainerView"))
        this.statusView().addItem(this.priceContainerView())
                
        this.setPriceView(NodeView.clone().setDivClassName("BMPostPriceView"))
        this.priceContainerView().addItem(this.priceView())
        
        this.priceView().setInvalidColor("red")
        this.priceView().isValid = function () {
            var s = this.innerHTML()
            var valid = !isNaN(parseFloat(s));
            //console.log("'" + s + "' isvalid " + valid)
            return valid
        }
        
        this.setCurrencyView(NodeView.clone().setDivClassName("BMPostPriceView").setInnerHTML("BTC"))
        this.priceContainerView().addItem(this.currencyView())
        
        this.currencyView().setInvalidColor("red")
        this.currencyView().setValidColor("black")
        this.currencyView().isValid = function () {
            var s = this.innerHTML()
            var valid = (s.toUpperCase() in CurrenciesDict) 
            return valid
        }
             
        this.setTitleView(NodeView.clone().setDivClassName("BMPostTitleView"))
        this.statusView().addItem(this.titleView())        

        this.setButtonView(NodeView.clone().setDivClassName("BMButtonView").setInnerHTML("Post"))
        this.statusView().addItem(this.buttonView())
        this.buttonView().setTarget(this).setAction("post")
        
        // stamp
        this.setPowContainerView(NodeView.clone().setDivClassName("BMPostPowContainerView"))
        this.statusView().addItem(this.powContainerView())
        this.setPowView(NodeView.clone().setDivClassName("BMPostPowView").setInnerHTML("pow"))
        this.powContainerView().addItem(this.powView())
        
        this.setPowIncrementView(NodeView.clone().setDivClassName("BMPostPowButtonView").setTarget(this).setAction("incrementPowTarget").setInnerHTML("+"))
        this.powContainerView().addItem(this.powIncrementView())
        
        this.setPowDecrementView(NodeView.clone().setDivClassName("BMPostPowButtonView").setTarget(this).setAction("decrementPowTarget").setInnerHTML("-"))
        this.powContainerView().addItem(this.powDecrementView())

        
        this.setDescriptionView(NodeView.clone().setDivClassName("BMPostDescriptionView").loremIpsum())
        this.addItem(this.descriptionView())
        
   
        this.titleView().setShowsHaloWhenEditable(true)
        this.priceView().setShowsHaloWhenEditable(true)
        this.currencyView().setShowsHaloWhenEditable(true)
        this.descriptionView().setShowsHaloWhenEditable(true)
        this.setEditable(true)
        return this
    },

    syncFromNode: function () {
        //this.log(this.type() + " syncFromNode2 " + this.node().type()); 
        var node = this.node()
        this.priceView().setInnerHTML(node.price())
        this.titleView().setInnerHTML(node.title())
        this.descriptionView().setInnerHTML(node.description())
        this.powView().setInnerHTML(node.powStatus())
        this.setEditable(node.isEditable())
        return this
    },
    
    syncToNode: function () {
        //this.log(this.type() + " syncToNode " + this.node().type())
        var node = this.node()
        node.setTitle(this.titleView().innerHTML())
        node.setPrice(this.priceView().innerHTML())
        node.setCurrency(this.currencyView().innerHTML())
        node.setDescription(this.descriptionView().innerHTML())
        NodeView.syncToNode.apply(this)     
        return this
    },
    
    setEditable: function (aBool) {
        this.priceView().setContentEditable(aBool)
        this.titleView().setContentEditable(aBool)
        this.descriptionView().setContentEditable(aBool)
        this.currencyView().setContentEditable(aBool)
        
        this.buttonView().setVisible(aBool)
        this.powIncrementView().setVisible(aBool)
        this.powDecrementView().setVisible(aBool)
        
        return this
    },
    
    post: function () {
        this.node().send()
        return this
    },
    
    onDidEdit: function (changedView) {        
        this.syncToNode()
    },
    
    incrementPowTarget: function() {
       this.node().incrementPowTarget()  
    },
    
    decrementPowTarget: function() {
        console.log("decrementPowTarget")
        this.node().decrementPowTarget()  
    },
})
