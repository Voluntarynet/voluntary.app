"use strict"

/*

    WebBrowserNotifications

    Simple interface to browser notifications. Takes care of:
    - only checking for permissions once
    - sending any waiting notifications after permission is gained
    - notification timeouts

    Todo: 
    - support for multiple waiting notes? waiting note limit
    - add any abstractions specific to special Chrome/Android notifications

    example use:

    WebBrowserNotifications.shared().newNote().setTitle("hello").setBody("...").tryToPost()

*/


window.WebBrowserNotifications = class WebBrowserNotifications extends ProtoClass {
    
    initPrototype () {
        this.newSlot("permissionRequestResult", null)
        this.newSlot("waitingNote", null)
    }

    init () {
        super.init()
        //throw new Error("this class is meant to be used as singleton, for now")
        return this
    }

    hasPermission () {
        return this.permissionRequestResult() === "granted"
    }

    wasDenied () {
        return this.permissionRequestResult() === "denied"
    }

    hasAskedForPermission () {
        return this.permissionRequestResult() !== null
    }

    requestPermissionIfNeeded () {
        if (!this.hasAskedForPermission()) {
            this.requestPermission()
        }
        return this
    }

    requestPermission () {
        Notification.requestPermission().then((result) => {
            this.setPermissionRequestResult(result)
            console.log("requestPermission:", result);
            this.postWaitingNotes()
        });
        Notification.requestPermission();
    }

    isSupported () {
        return window.hasOwnProperty("Notification")
    }

    postNote (aNote) {
        this.setWaitingNote(aNote)

        if (!this.isSupported()) {
            return this
        }

        this.requestPermissionIfNeeded() // will call this.postWaitingNotes()

        if (this.hasPermission()) {
            this.postWaitingNotes()
        }

        return this
    }

    postWaitingNotes () {
        if (this.waitingNote()) {
            this.waitingNote().tryToPost()
            this.setWaitingNote(null)
        }
        return this
    }

    newNote () {
        return WebBrowserNotification.clone()
    }
    
}.initThisClass()

