
/*
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
    
    imagesHeaderView: null,
    imageWellView: null,
}).setSlots({
    init: function () {
        NodeView.init.apply(this)
        
        this.setDivClassName("BMPostView")
        
        this.setStatusView(NodeView.clone().setDivClassName("BMPostStatusView"))
        this.addSubview(this.statusView())


        // path
        this.setPathView(NodeView.clone().setDivClassName("BMPostPathView"))
        this.statusView().addSubnode(this.pathView())

        // title
        this.setTitleView(NodeView.clone().setDivClassName("BMPostTitleView"))
        this.statusView().addSubnode(this.titleView())        
                
        // price container
        this.setPriceContainerView(NodeView.clone().setDivClassName("BMPostPriceContainerView"))
        this.statusView().addSubnode(this.priceContainerView())
                
        this.setPriceView(NodeView.clone().setDivClassName("BMPostPriceView"))
        this.priceContainerView().addSubnode(this.priceView())
        
        this.priceView().setInvalidColor("red")
        this.priceView().isValid = function () {
            var s = this.innerHTML()
            var valid = !isNaN(parseFloat(s));
            //console.log("'" + s + "' isvalid " + valid)
            return valid
        }
        
        this.setCurrencyView(NodeView.clone().setDivClassName("BMPostPriceView").setInnerHTML("BTC"))
        this.priceContainerView().addSubnode(this.currencyView())
        
        this.currencyView().setInvalidColor("red")
        this.currencyView().setValidColor("black")
        this.currencyView().isValid = function () {
            var s = this.innerHTML()
            var valid = (s.toUpperCase() in CurrenciesDict) 
            return valid
        }

        // post button
        this.setButtonView(NodeView.clone().setDivClassName("BMButtonView").setInnerHTML("Post"))
        this.statusView().addSubnode(this.buttonView())
        this.buttonView().setTarget(this).setAction("post")
        
        // stamp container
        this.setPowContainerView(NodeView.clone().setDivClassName("BMPostPowContainerView"))
        this.powContainerView().makeUnselectable() 
        this.statusView().addSubnode(this.powContainerView())

        
        this.setPowIncrementView(NodeView.clone().setDivClassName("BMPostPowIncrementButtonView").setTarget(this).setAction("incrementPowTarget").setInnerHTML("+"))
        this.powContainerView().addSubnode(this.powIncrementView())
        this.powIncrementView().makeUnselectable()
        
        this.setPowDecrementView(NodeView.clone().setDivClassName("BMPostPowDecrementButtonView").setTarget(this).setAction("decrementPowTarget").setInnerHTML("-"))
        this.powContainerView().addSubnode(this.powDecrementView())
        this.powDecrementView().makeUnselectable()

        this.setPowView(NodeView.clone().setDivClassName("BMPostPowView").setInnerHTML("pow"))
        this.powView().makeUnselectable()
        this.powContainerView().addSubnode(this.powView())
         
        this.setPostDateInfoView(NodeView.clone().setDivClassName("BMPostDateInfoView").setInnerHTML(""))
        this.postDateInfoView().makeUnselectable()
        this.powContainerView().addSubnode(this.postDateInfoView())
        
        // description
        this.setDescriptionView(NodeView.clone().setDivClassName("BMPostDescriptionView"))
        this.addSubview(this.descriptionView())
        
        // images header
        this.setImagesHeaderView(NodeView.clone().setDivClassName("BMImagesHeader").setInnerHTML("drop images below"))
        this.addSubview(this.imagesHeaderView())
        
        // image
        this.setImageWellView(ImageWellView.clone().setDivClassName("BMPostImageWellView"))
        this.addSubview(this.imageWellView())
        
   
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
//        this.log(this.type() + " syncFromNode2 " + this.node().type()); 
        
        var node = this.node()
        this.pathView().setInnerHTML(node.path().replaceAll("/", " / "))
        this.titleView().setInnerHTML(node.title())
        this.priceView().setInnerHTML(node.price())
        this.currencyView().setInnerHTML(node.currency())
        this.descriptionView().setInnerHTML(node.description())
        this.powView().setInnerHTML(node.powStatus())
        this.setEditable(node.isEditable())
        
        this.imageWellView().setImageDataURLs(node.imageDataURLs())
        
        if (this.hasSent()) {
            this.postDateInfoView().setInnerHTML(" expires in " + this.node().expireDescription())
        } else {
            this.postDateInfoView().setInnerHTML(" which expires in " + this.node().postPeriodDayCount() + " days")
        }
                
        return this
    },
    
    syncToNode: function () {
        this.log(this.type() + " syncToNode " + this.node().type())

        var node = this.node()
        node.setTitle(this.titleView().innerHTML())
        node.setPrice(this.priceView().innerHTML())
        node.setCurrency(this.currencyView().innerHTML())
        node.setDescription(this.descriptionView().innerHTML())
        
        node.setImageDataURLs(this.imageWellView().imageDataURLs())

        NodeView.syncToNode.apply(this)     
        return this
    },
    
    setEditable: function (aBool) {
        this.priceView().setContentEditable(aBool)
        this.titleView().setContentEditable(aBool)
        this.descriptionView().setContentEditable(aBool)
        this.currencyView().setContentEditable(aBool)
        
        this.buttonView().setIsVisible(aBool)
        this.powIncrementView().setDisplay(aBool ? "inline-block" : "none")
        this.powDecrementView().setDisplay(aBool ? "inline-block" : "none")
        
        this.imageWellView().setIsEditable(aBool)
        this.imagesHeaderView().setIsVisible(aBool)
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
        this.node().decrementPowTarget()  
    },
})

*/
