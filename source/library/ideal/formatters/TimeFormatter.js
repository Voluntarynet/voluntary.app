"use strict"

/*
    
TimeFormatter 

    Takes a javascript Date and can produces a formatted string description
    following the object's format option properties. 

	Example use:

    const formatter = TimeFormatter.clone()
    formatter.setIs24Hour(false)          // this is the default
    formatter.setShowsMeridiem(true)      // this is the default
    formatter.setUppercaseMeridiem(false) // this is the default
    formatter.setAmString("am")           // this is the default
    formatter.setPmString("am")           // this is the default
    formatter.setShowsSeconds(false)      // this is the default
    formatter.setShowsMilliseconds(false) // this is the default
    formatter.setHourMinuteSpacer(":")    // this is the default
    formatter.setDate(new Date())
    const aDateString = formatter.formattedValue()

    example output:

        "10:11am"


*/

window.TimeFormatter = class TimeFormatter extends ProtoClass {
    initPrototype () {
        this.newSlot("is24Hour", false)
        this.newSlot("showsMeridiem", true)
        this.newSlot("uppercaseMeridem", false)
        this.newSlot("amString", "am")
        this.newSlot("pmString", "pm")
        this.newSlot("doesPadHours", false)
        this.newSlot("showsHours", true)
        this.newSlot("hourMinuteSpacer", ":")
        this.newSlot("showsMinutes", true)
        this.newSlot("showsSeconds", false)
        this.newSlot("showsMilliseconds", false)
        this.newSlot("date", null) // a javascript Date object
    }

    init() {
        super.init()
    }

    paddedNumber (n, padLength) {
        if (!padLength) {
            padLength = 2
        }
        const s = "" + n
        if (s.length < padLength) { 
            return "0".repeat(padLength - s.length) + s
        }
        return s
    }

    getTwelveHours () {
        let h = this.date().getHours()
        if (h > 12) { h -= 12 }
        if (h === 0) { h = 12 }
        return h
    }

    zeroPaddedUSDate () {
        return this.paddedNumber(this.getTwelveHours()) + ":" + this.paddedNumber(this.getMinutes())
    }

    hoursString () {
        let h = this.date().getHours()

        if (!this.is24Hour()) {
            h = this.getTwelveHours()
        }
        
        if (this.doesPadHours()) {
            this.paddedNumber(h)
        }

        return "" + h
    }

    minutesString () {
        return this.paddedNumber(this.date().getMinutes())

    }

    secondsString () {
        return this.paddedNumber(this.date().getSeconds())
    }

    millisecondsString () {
        return this.paddedNumber(this.date().getMilliseconds() % 1000)
    }

    meridiemString() {
        let s = ""
        
        if (this.date().getHours() < 12) {
            s = this.amString()
        } else {
            s = this.pmString()
        }
        
        if (this.uppercaseMeridem()) {
            s = s.toUpperCase()
        }

        return s
    }

    formattedValue() {
        assert(this.date())
        let s = ""

        if (this.showsHours()) {
            s += this.hoursString()
        }

        if (this.showsMinutes()) {
            if (s.length) {
                s += this.hourMinuteSpacer()
            }
            s += this.minutesString()
        } 

        if (this.showsMeridiem()) { // correct location wrt seconds?
            s += this.meridiemString()
        } 

        if (this.showsSeconds()) {
            if (s.length) {
                s += this.hourMinuteSpacer()
            }
            s += this.secondsString()
        } 

        if (this.showsMilliseconds()) {
            if (s.length) {
                s += this.hourMinuteSpacer()
            }
            s += this.millisecondsString() 
        } 

        if (true) {
            const h = this.date().getHours()
            const m = this.date().getMinutes()
            if (h === 0 && m === 0) { 
                s = "midnight"
            }

            if (h === 12 && m === 0) { 
                s = "noon"
            }
        }

        return s
    }
}.initThisClass()




