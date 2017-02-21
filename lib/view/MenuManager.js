MenuManager = ideal.Proto.extend().newSlots({
    type: "MenuManager",
    showDebugMenus: false,
}).setSlots({

    setup: function () {
        var appName = App.shared().name()
        var remote = require('remote');
        var Menu = remote.require('menu');
        
        var template = [
          {
            label: appName,
            submenu: [
              {
                label: 'About ' + appName,
                selector: 'orderFrontStandardAboutPanel:'
              },
              {
                type: 'separator'
              },
              {
                label: 'Services',
                submenu: []
              },
              {
                type: 'separator'
              },
              {
                label: 'Hide ' + appName,
                accelerator: 'Command+H',
                selector: 'hide:'
              },
              {
                label: 'Hide Others',
                accelerator: 'Command+Shift+H',
                selector: 'hideOtherApplications:'
              },
              {
                label: 'Show All',
                selector: 'unhideAllApplications:'
              },
              {
                type: 'separator'
              },
              {
                label: 'Quit',
                accelerator: 'Command+Q',
                selector: 'terminate:'
              },
            ]
          },
          {
            label: 'Edit',
            submenu: [
              {
                label: 'Undo',
                accelerator: 'Command+Z',
                selector: 'undo:'
              },
              {
                label: 'Redo',
                accelerator: 'Shift+Command+Z',
                selector: 'redo:'
              },
              {
                type: 'separator'
              },
              {
                label: 'Cut',
                accelerator: 'Command+X',
                selector: 'cut:'
              },
              {
                label: 'Copy',
                accelerator: 'Command+C',
                selector: 'copy:'
              },
              {
                label: 'Paste',
                accelerator: 'Command+V',
                selector: 'paste:'
              },
              {
                label: 'Select All',
                accelerator: 'Command+A',
                selector: 'selectAll:'
              }
            ]
          }
          ]
          
          if (this.showDebugMenus()) {
              template.push(
              {
                label: 'View',
                submenu: [
                  {
                    label: 'Reload',
                    accelerator: 'Command+R',
                    click: function() { remote.getCurrentWindow().reload(); }
                  },
                  {
                    label: 'Toggle DevTools',
                    accelerator: 'Alt+Command+I',
                    click: function() { remote.getCurrentWindow().toggleDevTools(); }
                  },
                ]
              })
          }
          
          template.push({
            label: 'Window',
            submenu: [
              {
                label: 'Minimize',
                accelerator: 'Command+M',
                selector: 'performMiniaturize:'
              },
              {
                label: 'Close',
                accelerator: 'Command+W',
                selector: 'performClose:'
              },
              {
                type: 'separator'
              },
              {
                label: 'Bring All to Front',
                selector: 'arrangeInFront:'
              }
            ]
          }
        )
/*
        template.push({
            label: 'Help',
            submenu: []
        })
*/
      
        //console.log("template: ", JSON.stringify(template, null, 2))
        
        menu = Menu.buildFromTemplate(template);

        Menu.setApplicationMenu(menu);
    },
    
})