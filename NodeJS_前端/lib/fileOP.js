

module.exports=class File{

 /**
     * 类方法
     */

     //将数组格式的路径还原成字符串
    static restorePath(prefix,arg)
    {
        var path=prefix
        for(var i=0;i<arg.length;i++)
        {
          path+='\\'+arg[i]
        }
        return path
    }
    
    //获得文件后缀
    static getFileSuffix(filename)
    {
        var index=filename.lastIndexOf('.')
        var suffix='';
        if(index!=null)
        {
            suffix=filename.substring(index+1)
        }
        return suffix
    }

    //根据文件后缀判断是否可文本显示
    static isTextFile(filename)
    {
        var textFileSuffix=new Array('txt','md','ml','sd','java','c','cpp','py','html','js','json')
        var suffix=this.getFileSuffix(filename)

        for(var i=0;i<textFileSuffix.length;i++)
        {
            if(suffix==textFileSuffix[i])
            {
                return true
            }
        }
        return false
    }


    /**
     * 实例方法
     */
    constructor(path,filename){
        this.path=path
        this.filename=filename
    }

    getType(){


        
    }


}