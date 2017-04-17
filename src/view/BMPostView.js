/*
BMPostView = NodeView.extend().newSlots({
    type: "BMPostView",
    statusView: null,
    priceView: null,
    currencyView: null,
    titleView: null,
    descriptionView: null,
    regionView: null,
    categoryView: null,
    descriptionView: null,
    
    priceContainerView: null,
    buttonView: null,
    
    powView: null,
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
        
        this.setCurrencyView(NodeView.clone().setDivClassName("BMPostPriceView").setInnerHTML("BTC"))
        this.priceContainerView().addItem(this.currencyView())
        
        this.setTitleView(NodeView.clone().setDivClassName("BMPostTitleView"))
        this.statusView().addItem(this.titleView())        

        this.setButtonView(NodeView.clone().setDivClassName("BMButtonView").setInnerHTML("Post"))
        this.statusView().addItem(this.buttonView())
        this.buttonView().setTarget(this).setAction("post")
        
        this.setDescriptionView(NodeView.clone().setDivClassName("BMPostDescriptionView").loremIpsum())
        this.addItem(this.descriptionView())
        
        this.setPowView(NodeView.clone().setDivClassName("BMPowView"))
        this.addItem(this.powView())
        
        this.priceView().setInvalidColor("red")
        this.priceView().isValid = function () {
            var s = this.innerHTML();
            var valid = isNaN(parseFloat(s)) == false;
            //console.log("'" + s + "' isvalid " + valid)
            return valid;
        }
        
        
        this.currencyView().setInvalidColor("red")
        this.currencyView().isValid = function () {
            var s = this.innerHTML()
            //console.log("CurrenciesDict = ", CurrenciesDict)
            var valid = (s.toUpperCase() in CurrenciesDict) 
            return valid
        }
                
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
        this.currencyView().setInnerHTML(node.currency())
        this.descriptionView().setInnerHTML(node.description())
        this.powView().setInnerHTML(node.powStatus())
        return this
    },
    
    syncToNode: function () {
		ShowStack()
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
        return this
    },
    
    post: function () {
        this.node().send()
        return this
    },
    
    onDidEdit: function (changedView) {        
        this.syncToNode()
    },
})
*/