const { app, BrowserWindow,Menu } = require('electron')
const ipc=require('electron').ipcMain
const ipcRender=require('electron').ipcRenderer
const { dialog } = require('electron')
const fs=require('fs')

exports.barTable = [
    {
        label:'数据',
        submenu:[
            {
                label:'新建数据',
                id:'new-project',
                role:'new project',
                accelerator: 'alt+n',
                click:function(){
                    projectDialog()
                }
            },
            {
                label:'删除数据',
                id:'open-project',
                role:'open project',
                accelerator: 'alt+O',
                click:function(){
                    console.log('open project')
                    projectDialog()
            
                }
            }
        ]
    },
    
    {
      label: '开始识别',
    
    },


    {
      label: '帮助',
    }
  ]
  
  function projectDialog(){
    var proWindow=new BrowserWindow({
        show:false,
        frame:true,
        width:500,
        height:300,
        })
        proWindow.setMenu(null)
        proWindow.loadFile('./front-end/ChoseProject/index.html')
    
        proWindow.once('ready-to-show',()=>{
          proWindow.show()
          proWindow.webContents.send('recent-project',new Array('D:\\Project_CWing','D:\\Project_Wing\\VWing'))
        })
    
    
        ipc.once('cancel-open-project',(event,arg)=>{
    
          console.log('cancel-open-project')
          proWindow.close()
        })
    
  }