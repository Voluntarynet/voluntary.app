"use strict"

/*

    WebBrowserNotification


*/

window.WebBrowserNotification = class WebBrowserNotification extends ProtoClass {
    
    initPrototype () {
        this.newSlot("title", "")
        this.newSlot("body", null)
        this.newSlot("icon", null).setComment("a url to an image")
        this.newSlot("notificationRef", null)
        this.newSlot("timeoutMs", 4000)
    }

    init () {
        super.init()
        return this
    }

    tryToPost () {
        WebBrowserNotifications.postNote(this)
        return this
    }

    justPost () {
        const note = new Notification(this.title(), { body: this.body(), icon: this.icon() });
        this.setNotificationRef(note)
        this.startTimeout()
        return this
    }

    startTimeout () {
        setTimeout(notification.close.bind(this.notificationRef()), this.timeoutMs());
    }

}.initThisClass()



