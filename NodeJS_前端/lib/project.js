const fs=require('fs')
const Dirent=require('fs').Dirent
const ipc=require('electron').ipcMain





module.exports= class Project{

    /**
     * 类方法
     */

    //创建项目
    static createPoject(newPath)
    {
        try {
            this.states=fs.statSync(newPath);
        } catch (error) {
            if(error.code='ENOENT')
            {
                console.log(error.message)
                return 'path-Non-existent'
            }

        }
        
        

        return 'path right'

    }


    /**
     * 实例方法
     */
    constructor(path){
        this.path=path
        this.files=new Array()
        this.folders=new Array()
    }


    readDirs()
    {
        console.log('readDir start')
        console.log('Path:',this.path)
        this.dirs=fs.readdirSync(this.path,{encoding:"utf8",withFileTypes:true})

        //目录和文件分类
        for(var i=0;i<this.dirs.length;i++)
        {
            if(this.dirs[i].isDirectory())
            {
                this.folders=this.folders.concat(this.dirs[i])
               
            }
            else
            {
                this.files=this.files.concat(this.dirs[i])
            }
        }
        console.log('folder number:',this.folders.length)
        console.log('file number:',this.files.length)
        console.log('readDir end')
        console.log('')
    }


    printDirs()
    {
        console.log('printDir start')

        for(var i=0;i<this.dirs.length;i++)
        {
          console.log(this.dirs[i].name)
        }
        console.log('printDir end')
        console.log('')
    }



}







/**
 * 有关项目管理的ipc通讯
 */
ipc.on('open-project',()=>{

})

ipc.on('new-project',()=>{
    
})