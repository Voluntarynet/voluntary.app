
BMClassifiedPostView = NodeView.extend().newSlots({
    type: "BMPostView",
    statusView: null,
    
    pathView: null,
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
    
    descriptionView: null,

    postDateInfoView: null,    
    
    // post
    buttonView: null,

}).setSlots({
    init: function () {
        NodeView.init.apply(this)
        
        this.setDivClassName("BMPostView")
        
        this.setStatusView(NodeView.clone().setDivClassName("BMPostStatusView"))
        this.addItem(this.statusView())


        // path
        this.setPathView(NodeView.clone().setDivClassName("BMPostPathView"))
        this.statusView().addItem(this.pathView())

        // title
        this.setTitleView(NodeView.clone().setDivClassName("BMPostTitleView"))
        this.statusView().addItem(this.titleView())        
                
        // price container
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

        // post button
        this.setButtonView(NodeView.clone().setDivClassName("BMButtonView").setInnerHTML("Post"))
        this.statusView().addItem(this.buttonView())
        this.buttonView().setTarget(this).setAction("post")
        
        // stamp container
        this.setPowContainerView(NodeView.clone().setDivClassName("BMPostPowContainerView"))
        this.powContainerView().makeUnselectable() 
        this.statusView().addItem(this.powContainerView())

        
        this.setPowIncrementView(NodeView.clone().setDivClassName("BMPostPowIncrementButtonView").setTarget(this).setAction("incrementPowTarget").setInnerHTML("+"))
        this.powContainerView().addItem(this.powIncrementView())
        this.powIncrementView().makeUnselectable()
        
        this.setPowDecrementView(NodeView.clone().setDivClassName("BMPostPowDecrementButtonView").setTarget(this).setAction("decrementPowTarget").setInnerHTML("-"))
        this.powContainerView().addItem(this.powDecrementView())
        this.powDecrementView().makeUnselectable()

        this.setPowView(NodeView.clone().setDivClassName("BMPostPowView").setInnerHTML("pow"))
        this.powView().makeUnselectable()
        this.powContainerView().addItem(this.powView())
         
        this.setPostDateInfoView(NodeView.clone().setDivClassName("BMPostDateInfoView").setInnerHTML(""))
        this.postDateInfoView().makeUnselectable()
        this.powContainerView().addItem(this.postDateInfoView())
        
        // description
        this.setDescriptionView(NodeView.clone().setDivClassName("BMPostDescriptionView").loremIpsum())
        this.addItem(this.descriptionView())
        
   
        // editing
        this.titleView().setShowsHaloWhenEditable(true)
        this.priceView().setShowsHaloWhenEditable(true)
        this.currencyView().setShowsHaloWhenEditable(true)
        this.descriptionView().setShowsHaloWhenEditable(true)
        this.setEditable(true)
        return this
    },
    
    hasSent: function() {
        return this.node().hasSent()
    },
    

    
    syncFromNode: function () {
        //this.log(this.type() + " syncFromNode2 " + this.node().type()); 
        var node = this.node()
        this.pathView().setInnerHTML(node.path().replaceAll("/", " / "))
        this.titleView().setInnerHTML(node.title())
        this.priceView().setInnerHTML(node.price())
        this.currencyView().setInnerHTML(node.currency())
        this.descriptionView().setInnerHTML(node.description())
        this.powView().setInnerHTML(node.powStatus())
        this.setEditable(node.isEditable())
        
        if (this.hasSent()) {
            this.postDateInfoView().setInnerHTML(" expires in " + this.node().expireDescription())
        } else {
            this.postDateInfoView().setInnerHTML(" which expires in " + this.node().postPeriodDayCount() + " days")
        }
        
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
        this.powIncrementView().setDisplay(aBool ? "inline-block" : "none")
        this.powDecrementView().setDisplay(aBool ? "inline-block" : "none")
        
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
