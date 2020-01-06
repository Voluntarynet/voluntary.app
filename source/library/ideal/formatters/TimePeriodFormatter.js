"use strict"

/*
    
TimePeriodFormatter 

    Takes a number of seconds and formats in a compact format.

	Example use:

	const stringVersion = TimePeriodFormatter.clone().setValueInSeconds(seconds).formattedValue()

	Example output:

	if seconds was 10, stringVersion would be 10s.
	if seconds was 60, stringVersion would be 1m.
	if seconds was 3600, stringVersion would be 1h.
	if seconds was 172800, stringVersion would be 2d.
	etc.

*/

window.TimePeriodFormatter = class TimePeriodFormatter extends ProtoClass {
    initPrototype () {
        this.newSlot("valueInSeconds", 0)
    }

    init() {
        super.init()
    }

    formattedValue() {
        const periods = {
            seconds: "s", 
            minutes: "m", 
            hours: "h", 
            days: "d", 
            months: "months", 
            years: "years"
        }

        const seconds = this.valueInSeconds()
        if (seconds === null) {
            return "?"
        }

        if (seconds < 60) {
            return Math.floor(seconds) + periods.seconds
        }
        
        const minutes = Math.floor(seconds/60)
        if (minutes < 60) {
            return minutes + periods.hours
        }

        const hours = Math.floor(minutes/60)
        if (hours < 24) {
            return hours + periods.hours
        }
        
        const days = Math.floor(hours/24)
        return days + periods.days
    }
}.initThisClass()
