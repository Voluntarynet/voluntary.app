"use strict"

/*

	ByteFormatter takes a number of bytes and returns a string with the order of magnitude in 
	standard SI decimal ditial information format.

	example use:

	var stringVersion = ByteFormatter.clone().setValue(aNumberOfBytes).formattedValue()

	example output:

	if aNumberOfBytes was 300, stringVersion would be 300 bytes.
	if aNumberOfBytes was 3,000, stringVersion would be 3 kB.
	if aNumberOfBytes was 30,000, stringVersion would be 30 kB.
	if aNumberOfBytes was 300,000, stringVersion would be 300 kB.
	if aNumberOfBytes was 3,000,000, stringVersion would be 3 MB.
	etc.

*/

class ByteFormatter extends ProtoClass {
    init() {
        super.init()
        this.newSlots({
            value: 0,
            usePostfix: true,
            useSpace: false,
            useLongNames: false,
            orderNamesShort: ["bytes", "k", "M", "G", "T", "P", "E", "Z", "Y"],
            orderNamesLong: [
                "bytes", 
                "kilobytes", 
                "megabytes", 
                "gigabytes", 
                "terabytes", 
                "petabytes", 
                "exabytes", 
                "zettabytes", 
                "yottabytes"],
        })
    }

    formattedValue() {
        var b = Math.floor(this.value());
        var postfix = this.usePostfix() ? "B" : "";
        var space = this.useSpace() ? " " : "";
		
        var orderNames = this.useLongNames() ? this.orderNamesLong() : this.orderNamesShort();
        var order = Math.floor(Math.log10(b)/3)
        order = Math.min(order, orderNames.length - 1)
        var orderName = orderNames[order]

        if (order == 0 || this.useLongNames()) {
            space = " "
            postfix = ""
        }

        var v = Math.floor(b / Math.pow(10, order))
		
        // remove plural if v == 1
        if (orderName[orderName.length-1] == "s" && v == 1) {
            orderName = orderName.substring(0, orderName - 2)
        }
		
        return v + space + orderName + postfix
    }
}

ByteFormatter.registerThisClass()

/*
window.ByteFormatter = ideal.Proto.extend().newSlots({
    type: "ByteFormatter",
    value: 0,
    usePostfix: true,
    useSpace: false,
    useLongNames: false,
    orderNamesShort: ["bytes", "k", "M", "G", "T", "P", "E", "Z", "Y"],
    orderNamesLong: [
        "bytes", 
        "kilobytes", 
        "megabytes", 
        "gigabytes", 
        "terabytes", 
        "petabytes", 
        "exabytes", 
        "zettabytes", 
        "yottabytes"],
}).setSlots({

    formattedValue: function () {
        var b = Math.floor(this.value());
        var postfix = this.usePostfix() ? "B" : "";
        var space = this.useSpace() ? " " : "";
		
        var orderNames = this.useLongNames() ? this.orderNamesLong() : this.orderNamesShort();
        var order = Math.floor(Math.log10(b)/3)
        order = Math.min(order, orderNames.length - 1)
        var orderName = orderNames[order]

        if (order == 0 || this.useLongNames()) {
            space = " "
            postfix = ""
        }

        var v = Math.floor(b / Math.pow(10, order))
		
        // remove plural if v == 1
        if (orderName[orderName.length-1] == "s" && v == 1) {
            orderName = orderName.substring(0, orderName - 2)
        }
		
        return v + space + orderName + postfix
    },

})

*/