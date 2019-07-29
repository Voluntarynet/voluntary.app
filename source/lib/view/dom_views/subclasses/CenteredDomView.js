"use strict"

/*

    CenteredDomView

      From a StackExchange answer:

      .outer {
        display: table;
        position: absolute;
        height: 100%;
        width: 100%;
      }

      .middle {
        display: table-cell;
        vertical-align: middle;
      }

      .inner {
        margin-left: auto;
        margin-right: auto;
        width: 400px;
        //whatever width you want
      }

      <div class="outer">
        <div class="middle">
          <div class="inner">
            <h1>The Content</h1>
            <p>Once upon a midnight dreary...</p>
          </div>
        </div>
      </div>

*/

DomView.newSubclassNamed("CenteredDomView").newSlots({
    middleView: null,
    innerView: null,
}).setSlots({
    init: function () {
        DomView.init.apply(this)
        this.setupOuterView()
        this.setupMiddleView()
        this.setupInnerView()
        return this
    },

    setupOuterView: function() {
        //this.setDivClassName("CenteredDomView")
        this.setDisplay("table")
        this.setPosition("absolute")
        this.setHeightPercentage(100)
        this.setWidthPercentage(100)
        this.addSubview(v)
    },

    setupMiddleView: function() {
        let v = DomView.clone()
        v.setDivClassName("CenteredDomView_middleView")
        v.setDisplay("table-cell")
        v.setVerticalAlign("middle")
        this.addSubview(v)
        return this
    },

    setupInnerView: function() {
        let v = DomView.clone()
        v.setDivClassName("CenteredDomView_innerView")
        v.setDisplay("block")
        v.setMarginLeft("auto")
        v.setMarginRight("auto")
        v.innerView().setWidth(400)
        this.middleView().addSubview(v)
        return this
    },

    // TODO: consider if a separate reference to contentView should be kept

    setContentView: function(aView) {
        let iv = this.innerView()
        if (iv.hasSubview(aView)) {
            iv.removeAllSubviews()
            iv.addSubview(aView)
        }
        return this
    },

    contentView: function() {
        return this.innerView().subviews().first()
    },

    setContentWidth: function(w) {
        this.innerView().setWidth(400)
        return this
    },
})
