const { app, BrowserWindow,Menu } = require('electron')
const ipc=require('electron').ipcMain
const { dialog } = require('electron')
const fs=require('fs')
const menu=require('./lib/menu')


let mainWindow
let menuBar


/**
 * app生命周期管理 
 */
app.on('ready', () => {
  startUp() 
});

// 当全部窗口关闭时退出。
app.on('window-all-closed', () => {
  //app.quit()
})

app.on('activate', () => {

})





/**
 * icp信息处理
 */



//调用系统选择文件夹
ipc.on('chose-image',(event,arg)=>{
  var path=dialog.showOpenDialog({properties: ['openDirectory', 'promptToCreate']})
  event.sender.send('rs-image-path',path)

})


//启动
function startUp()
{
  console.log('>>>startUp start')

  createMainWindow()

  console.log('>>>startUp end\n')
}


//创建主窗口
function createMainWindow(){
    mainWindow=new BrowserWindow({
      show: false,
      icon:'./figure/Logo.png', 
      frame: true,
      backgroundColor: '#bad7df',
    });

    mainWindow.loadFile('./front-end/MainWindow/index.html');
    mainWindow.on('closed', () => {
      app.quit();
    })

    menuBar=Menu.buildFromTemplate(menu.barTable)
    mainWindow.setMenu(menuBar);
    
    mainWindow.once('ready-to-show', () => {
      mainWindow.show()
    })

}