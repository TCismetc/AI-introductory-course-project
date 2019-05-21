const ipc=require("electron").ipcMain
const fs=require('fs')

//当前打开的SD文件列表
const SDArg=new Array()

//查找文件是否打开,找到则返回位置，否则返回null
function seekSD(path)
{
    for(let i=0;i<SDArg.length;i++)
    {
        if(path==SDArg[i].path)
        {
            return i
        }
    }

    return null
}


//关于可视化操作的IPC监听
exports.VMIpc=function()
{

    //打开SD文件
    ipc.on('open-sd',(event,arg)=>{
        console.log('open-sd:',arg[0])

        if(seekSD(arg[0])==null)
        {
            var sdFile=new SD(arg[0])
            SDArg.push(sdFile)
        }

    })

    //关闭SD文件
    ipc.on('close-sd',(event,arg)=>{
        console.log('close-sd:',arg[0])

        if(seekSD(arg[0])==null)
        {
            SDArg.splice(index,1)
        }

    })


    //添加VM
    ipc.on('add-vm',(event,arg)=>{

        console.log('add-vm')
        var sdFile=arg[0]
        var type=arg[1]
        var path=arg[2]
        var id=arg[3]

        var vm=new VM(type,path,id)
        var index=seekSD(sdFile)

        if(index!=null)
        {
            SDArg[index].addVM(vm)
            console.log('add-vm success')
        }
        else
        {
            console.log('add-vm fail')
        }

    })
      
    //删除VM
    ipc.on('delete-vm',(event,arg)=>{
        console.log('delete-vm')
        var sdFile=arg[0]
        var moduleId=arg[1]

        var index=seekSD(sdFile)

        if(index!=null)
        {
            SDArg[index].deleteVM(moduleId)
        }

        console.log(sdFile,':',moduleId,')\n')
    })
      

    //移动VM，清除原连接关系,arg=>{sdFilePath,thisModuleId,topId,bottomId,leftId,rightId}
    ipc.on('move-vm',(event,arg)=>{
        console.log('move-vm')
        console.log('sdFile:',arg[0],' thisId:',arg[1],'  topId:',arg[2],'  bottomId:',arg[3],'  leftId:',arg[4],'  rightId:',arg[5])

        var index=seekSD(arg[0])
        //调用清除函数
        if(index!=null)
        {
            SDArg[index].deleteSplicing(arg)
        }
    })
      
    //VM拼接操作监听
    ipc.on('left-splicing',(event,arg)=>{
      
        console.log(arg[0],'left-splicing:')

        var module_1=arg[1]
        var module_2=arg[2]
        var sp=new SpNode('left',module_1,module_2,null)

        var index=seekSD(arg[0])
        if(index!=null)
        {
            SDArg[index].addSplicing(sp)
            console.log(module_2,'---',module_1)
        } 
        console.log('sdSpNum=',SDArg[index].workspace.length)
    })
      
    ipc.on('right-splicing',(event,arg)=>{
      
        var module_1=arg[1]
        var module_2=arg[2]
        var sp=new SpNode('right',module_1,module_2,null)

        var index=seekSD(arg[0])
        if(index!=null)
        {
            SDArg[index].addSplicing(sp)
            console.log(module_2,'---',module_1)
        } 
        console.log('sdSpNum=',SDArg[index].workspace.length)

    })
      
    ipc.on('top-splicing',(event,arg)=>{
      
        var module_1=arg[1]
        var module_2=arg[2]
        var sp=new SpNode('top',module_1,module_2,null)

        var index=seekSD(arg[0])
        if(index!=null)
        {
            SDArg[index].addSplicing(sp)
            console.log(module_2,'---',module_1)
        } 
        console.log('sdSpNum=',SDArg[index].workspace.length)

    })
      
    ipc.on('bottom-splicing',(event,arg)=>{
      
        var module_1=arg[1]
        var module_2=arg[2]
        var sp=new SpNode('bottom',module_1,module_2,null)

        var index=seekSD(arg[0])
        if(index!=null)
        {
            SDArg[index].addSplicing(sp)
            console.log(module_2,'---',module_1)
        } 
        console.log('sdSpNum=',SDArg[index].workspace.length)

    })
}





/**
 * 可视化文件内容生成
 */

exports.genSDFile=function(path)
{
    console.log('gen sdfile:',path)
    var index=seekSD(path)
    console.log('index:',index)
    if(index==null)
    {
        return 
    }

    var sd=SDArg[index]
    var sdId=0
    var content=''

    //文件偷头部生成
    content+=genSDHead(sd.path,0,1,'test sd file','Java')

    //引用生成
    for(let i=0;i<sd.importArg.length;i++)
    {
        content+=genRefer(sd.importArg[i].path,sdId++,sd.importArg[i].path)
    }
    content+='\r\n\r\n'

    //变量声明部生成



    //workspcae生成
    for(let i=0;i<sd.workspace.length;i++)
    {
        let cd=sd.workspace[i]
        if(cd.type=='sp')
        {
            let sp=cd.content
            if(sp.type=='top')
            {
                content+=genSequenceSplicing(sp.module_2,sp.module_1,sp.adapter,sdId++,null)
            }
            else if(sp.type=='bottom')
            {
                content+=genSequenceSplicing(sp.module_1,sp.module_2,sp.adapter,sdId++,null)
            }
            else if(sp.type=='right')
            {
                content+=genparallelSplicing(sp.module_1,sp.module_2,sp.adapter,sdId++,null)
            }
            else if(sp.type=='left')
            {
                content+=genparallelSplicing(sp.module_2,sp.module_1,sp.adapter,sdId++,null)
            }
        }

    }
    content+='\r\n\r\n'

    //类，函数部分生成
    

    //文件尾部生成
    content+=genSDTail()


    return content

}




/**
 * 可视化文件类
 */
class SD{


    constructor(path)
    {
        this.path=path


        this.importArg=new Array()
        this.VMArg=new Array()
        this.workspace=new Array()

        this.idOffset=0
    }

    //添加一个可视化元素
    addVM(vm)
    {
        var flag =false;

        this.VMArg.push(vm)
        
        for(var i=0;i<this.importArg.length;i++)
        {
            if(vm.path==this.importArg[i].path)
            {
                flag=true;
                this.importArg[i].num++;
                break;
            }
        }
 
        if(!flag)
        {
            //添加Import
            var imp=new ImportVM(vm.path)
            this.importArg.push(imp)
            this.importArg[i].num++
        }
    }

    deleteVM(id)
    {
        for(var i=0;i<this.VMArg.length;i++)
        {
            if(this.VMArg[i].id==id)
            {
                this.VMArg.splice(i,1)
            }
        }
    }

    addSplicing(vmSp)
    {
        var node=new CodeNode('sp',++this.idOffset,'',vmSp)
        console.log('addSplcing:','id=',node.id,'  type=',node.content.type)
        this.workspace.push(node)
    }


    deleteSplicing(arr)
    {
        var thisId=arr[1]
        var index
        for(var i=2;i<6;i++)
        {
            index=this.seekSP(thisId,arr[i])
            if(index!=null)
            {
                this.workspace.splice(index,1)
            }

        }

    }



    outputSDFile()
    {

    }

    seekVM(id)
    {
        for(var i=0;i<this.VMArg.length;i++)
        {
            if(this.VMArg[i].id==id)
            {
              return this.VMArg[i]
            }
        }
    }

    seekSP(id_1,id_2)
    {
        if(id_1==null||id_2==null)
        {
            return null
        }
        for(var i=0;i<this.workspace.length;i++)
        {
            if(this.workspace[i].type=='sp')
            {
                var sp=this.workspace[i].content
                if((id_1==sp.module_1&&id_2==sp.module_2)||(id_1==sp.module_2&&id_2==sp.module_1))
                {
                    return i 
                }
            }
        }
        return null
    }

}


/**
 * 可视化元素类
 */
class VM{

    //VM为适配器时，interfaceArg尺寸为2，为待对接的两个接口
    constructor(type,path,id)
    {
        this.type=type
        this.path=path
        this.id=id
        this.pattern=null
        this.interfaceArg=null
    }

}

class SpNode{

    constructor(type,module_1,module_2,adapterArg)
    {
        this.type=type
        this.module_1=module_1
        this.module_2=module_2
        this.adapterArg=adapterArg

        this.nextNode=null          //连续拼接时存下一个后续拼接节点
    }

}

class CodeNode{

    //type:code/sp/varable/constat
    constructor(type,id,name,content)
    {
        this.type=type;
        this.id=id;
        this.name=name;
        this.content=content;
    }
}


class ImportVM{

    //path 引用路径，当前被使用数量
    constructor(path)
    {
        this.path=path;
        this.num=0;
    }

}




function genSDHead(name,id,version,describe,language)
{
    var content='<MD\r\n'
    content+='    name=\"'+name+'\"\r\n'
    content+='    id=\"'+id+'\"\r\n'
    content+='    version=\"'+version+'\"\r\n'
    content+='    describe=\"'+describe+'\"\r\n'
    content+='    language=\"'+language+'\"\r\n'


    content+='>\r\n\r\n'
    console.log(content)
    return content
}

function genSDTail()
{
    return '</MD>'
}

function genRefer(name,id, src)
{
    var content='<refer name=\"'+name+'\" id=\"'+id+'\" src=\"'+src+'\" />\r\n'
    return content
}

function genVar(name,id,type,value)
{
    var content='<variable name=\"'+name+'\" id=\"'+id+'\" type=\"'+type+'\">'+value+'</variable>\r\n'
    return content
}

function genNoduleDec(name,id,referId,pattern)
{
    var content='<Module name=\"'+name+'\" id=\"'+id+'\" referId=\"'+referId+'\" pattern=\"'+pattern+'\">\r\n'
    return content
}
function genConstant(name,id,type,describe,value)
{
    var content='<constant name=\"'+name+'\" id=\"'+id+'\" type=\"'+type+'\" describe=\"'+describe+'\">'+value+'</constant>    '
    return content
}
function genWorkspaceStart()
{
    var content='<workspace>\r\n\r\n'
    return content
}
function genWorkspaceEnd()
{
    var content='</workspace>\r\n\r\n'
    return content
}

function genSequenceSplicing(upper,bellow,adapter,offset,interfaceArg)
{
    var content='<splicing upper=\"'+upper+'\" bellow=\"'+bellow+'\" offset=\"'+offset+'\"'
    if(adapter!=null)
    {
        content+='adapter=\"'+adapter+'\">\r\n'
    }
    else{
        content+='>\r\n'
    }

    if(interfaceArg!=null)
    {
        for(var i=0;i<interfaceArg.length;i++)
        {
            content+='<Inter-Connect upperInterId=\"'+interface[i].inter_1+'\" belowInterId=\"'+interface[i].inter_2+'\">\r\n'
        }
    }

    content+='</splicing>\r\n\r\n'
    return content
}


function genparallelSplicing(left,right,adapter,offset,interfaceArg)
{
    var content='<splicing left=\"'+left+'\" right=\"'+right+'\" offset=\"'+offset+'\">\r\n'
    
    if(adapter!=null)
    {
        content+='adapter=\"'+adapter+'\">\r\n'
    }
    else{
        content+='>\r\n'
    }

    if(interfaceArg!=null)
    {
        for(var i=0;i<interfaceArg.length;i++)
        {
            content+='<Inter-Connect leftInterId=\"'+interface[i].inter_1+'\" rightInterId=\"'+interface[i].inter_2+'\">\r\n'
        }
    }
    

    content+='</splicing>\r\n\r\n'
    return content
}



