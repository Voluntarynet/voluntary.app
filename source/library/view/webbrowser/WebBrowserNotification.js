"use strict"

/*

    WebBrowserNotification


*/

window.WebBrowserNotification = class WebBrowserNotification extends ProtoClass {
    
    initPrototype () {
        this.newSlots({
            title: "",
            body: null,
            icon: null, // a url to an image
            notificationRef: null,
            timeoutMs: 4000,
        })

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



