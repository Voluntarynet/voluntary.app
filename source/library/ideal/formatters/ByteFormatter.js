"use strict"

/*

    ByteFormatter
    
	ByteFormatter takes a number of bytes and returns a string with the order of magnitude in 
	standard SI decimal ditial information format.

	example use:

	const stringVersion = ByteFormatter.clone().setValue(aNumberOfBytes).formattedValue()

	example output:

	if aNumberOfBytes was 300, stringVersion would be 300 bytes.
	if aNumberOfBytes was 3,000, stringVersion would be 3 kB.
	if aNumberOfBytes was 30,000, stringVersion would be 30 kB.
	if aNumberOfBytes was 300,000, stringVersion would be 300 kB.
	if aNumberOfBytes was 3,000,000, stringVersion would be 3 MB.
	etc.

*/

window.ByteFormatter = class ByteFormatter extends ProtoClass {
    initPrototype () {

        this.newSlot("value", 0)
        this.newSlot("usePostfix", true)
        this.newSlot("useSpace", false)
        this.newSlot("useLongNames", false)
        this.newSlot("orderNamesShort", ["bytes", "k", "M", "G", "T", "P", "E", "Z", "Y"])
        this.newSlot("orderNamesLong", [
            "bytes", 
            "kilobytes", 
            "megabytes", 
            "gigabytes", 
            "terabytes", 
            "petabytes", 
            "exabytes", 
            "zettabytes", 
            "yottabytes"])
    }

    init() {
        super.init()
    }

    formattedValue() {
        const b = Math.floor(this.value());
        let postfix = this.usePostfix() ? "B" : "";
        let space = this.useSpace() ? " " : "";
		
        const orderNames = this.useLongNames() ? this.orderNamesLong() : this.orderNamesShort();
        let order = Math.floor(Math.log10(b)/3)
        order = Math.min(order, orderNames.length - 1)
        const orderName = orderNames[order]

        if (order === 0 || this.useLongNames()) {
            space = " "
            postfix = ""
        }

        const v = Math.floor(b / Math.pow(10, order*3))
		
        // remove plural if v === 1
        if (orderName[orderName.length-1] === "s" && v === 1) {
            orderName = orderName.substring(0, orderName - 2)
        }
		
        return v + space + orderName + postfix
    }
}.initThisClass()
