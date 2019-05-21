const ipc=require('electron').ipcRenderer

var chose=document.getElementById('chose-image')
var ok=document.getElementById('ok')
var cancel=document.getElementById('cancel')
var pathContent=document.getElementById('path-content')
var projectPath=null;


var nameContent=document.getElementById('name-content')



chose.onclick=function(){

    ipc.send('chose-image',null)

}


ok.onclick=function(){
    if(pathContent.value==''||nameContent.value=='' )
    {
        alert('请输入完整的信息')
    }
    else
    {
        ipc.send('submit-info',new Array(pathContent.value,nameContent.value))

    }
}

cancel.onclick=function(){
    ipc.send('cancel-open-project',null)
}


ipc.on('rs-image-path',(event,arg)=>{


    projectPath=arg
    pathContent.value=projectPath
})



