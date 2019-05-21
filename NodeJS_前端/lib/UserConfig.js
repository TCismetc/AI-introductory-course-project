const fs=require('fs')


module.exports=class UserConfig{

    static creatDir()
    {
        fs.mkdir('./Users', (err) => {
            if (err) throw err;
            console.log('Tip: mkdir Users Folder success')
          });
    }

    static createProjectCngFile()
    {
        fs.writeFile('./Users/project.cng','',(err)=>{


            console.log('Tip:new project.cng file success')
        })
    }

    static creatAppConfing()
    {
        fs.writeFile('./Users/app.cng','',(err)=>{

            console.log('Tip:new app.cng file success')
        })
    }










}