
BMBitcoinWallet = BMApplet.extend().newSlots({
    type: "BMBitcoinWallet",
}).setSlots({

    init: function () {
        BMApplet.init.apply(this)
        this.setTitle("Bitcoin Wallet")

    },
})

