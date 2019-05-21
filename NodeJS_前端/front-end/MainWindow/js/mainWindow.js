const ipc=require('electron').ipcRenderer




var leftView=document.getElementById('left-view')
var workspace=document.getElementById('workspace')
var filesState=document.getElementById('files-state')
var activeFile=null;
var openFilesArg=new Array()	//已打开文件列表，前缀为空，根目录为project Path
var VMArg=new Array();			//已创建的元素

/**
 * 左侧栏操作
 */
var projectInner=document.getElementById('project-inner')



  /**
   * ipc通信
   */

  ipc.on('updataFile',(event, arg) => {
	for(var i=0;i<arg[0][0].length;i++)
	{
		LeftViewOP.addFolderSpan(projectInner,new Array(),arg[0][0][i].name)
	}

	for(var i=0;i<arg[1][0].length;i++)
	{
		LeftViewOP.addFileSpan(projectInner,new Array(),arg[1][0][i].name)
	}

})

ipc.on('updataFolder',(event, arg) => {

	for(var i=0;i<arg.length;i++)
	{
		LeftViewOP.addFolderSpan(projectInner,new Array(),arg[i].name)
	}

})

ipc.on('save-click',(event,arg)=>{

	
	if(activeFile==null)
	{

		return 
	}
	var filePath=File.restorePath('',activeFile.path)
	if(!activeFile.isVisual)
	{

		event.sender.send('save-text-file',new Array(filePath,activeFile.text.value))
		
	}
	else{
		
		event.sender.send('save-sd-file',new Array(filePath))
	}


})


/**
 * 类定义
 */

//左侧视图操作类
class LeftViewOP{

	/**
	 * 类级函数
	 */

	 // 打开文件
	static openTextFile(path,content){

		var pathStr=File.restorePath('',path)
		
		if(File.isOpenFile(pathStr))
		{
		}
		else
		{
			

			var file=new File(path,false)
			file.createTextContent(workspace,content);
			file.createFileStateDiv(filesState)
			openFilesArg.push(file)
			File.workFilesSwitch(file)
			
			return file 
		}
	}



	//添加一个文件
	static addFileSpan(parentElem,parentPath,filename)
	{
		var path=parentPath.concat(filename)

		var br=document.createElement('br')
		var para=document.createElement("span");
		var isOpen=false;

		//文本内容生成
		var text='\u00A0\u00A0\u00A0'
		for(var i=0;i<parentPath.length;i++)
		{
			text+=text
		}
		if(parentPath.length>0)
		{
			text+='┗\u00A0'
		}
		var node=document.createTextNode(text+filename);

		para.id='file-'+filename
		para.appendChild(node);
		para.classList.add('file-span')

		parentElem.appendChild(para);
		parentElem.appendChild(br)


		para.ondblclick=function(){
		
				//如果SD文件则打开可视化操作工作区
				if(File.getFileSuffix(filename)=='sd'){

					LeftViewOP.openVisualFile(path,'')
				}
				else if(File.isTextFile(filename))
				{
					
					ipc.send('open-file',path)
					ipc.once('answer-open-file'+filename,(event, arg) => {
						
						LeftViewOP.openTextFile(path,arg)
					})
				}
				else
				{
					alert('文件无法识别或直接打开')
				}

			
		}
	}

	//添加一个文件夹
	static addFolderSpan(parentElem,parentPath,filename)
	{
		var path=parentPath.concat(filename)


		var br=document.createElement('br')
		var para=document.createElement("span")
		var icon=document.createElement('span')


		icon.className='folder-icon'
		//文本内容生成
		var text='\u00A0\u00A0\u00A0'
		for(var i=0;i<parentPath.length;i++)
		{
			text+=text
		}
		if(parentPath.length>0)
		{
			text+='┗\u00A0'
		}
		var node1=document.createTextNode(text);
		var node2=document.createTextNode('\u00A0'+filename);
		
		//添加folder
		para.id='file-'+filename
		para.appendChild(node1)
		para.appendChild(icon)
		para.appendChild(node2)
		para.classList.add('file-span')
		parentElem.appendChild(para)
		parentElem.appendChild(br)

		//添加subDiv-显示子菜单
		var subDiv=document.createElement('div')
		subDiv.className='inner-inactive'
		parentElem.appendChild(subDiv)

		//文件夹点击事件-展开子菜单
		para.onclick=function(){

			if(subDiv.className!='inner-inactive')
			{
				
				for(var i =subDiv.childNodes.length-1; i>=0; i--) { 
					subDiv.removeChild(subDiv.childNodes[i]); 
					} 
					subDiv.className='inner-inactive'
			}
			else{

				ipc.send('require-subfile',path)

				ipc.once('answer-subfile-'+filename,(event, arg) => {
					//arg有两个元素，0为folder数据，1为file数据
					for(var i=0;i<arg[0].length;i++)
					{
							LeftViewOP.addFolderSpan(subDiv,path,arg[0][i].name)
					}

					for(var i=0;i<arg[1].length;i++)
					{
							LeftViewOP.addFileSpan(subDiv,path,arg[1][i].name)
					}
					subDiv.className='sub-inner-active'
				})
				
			}
		}
	}



}







  //文件类
  class File{
	/**
	 * 类级函数定义
	 */

	//还原路径名
	static restorePath(prefix,arg)
	{
		var path=prefix
		for(var i=0;i<arg.length;i++)
		{
		  path+='\\'+arg[i]
		}
		return path
	}
	
	//获取文件名后缀
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
		var suffix=File.getFileSuffix(filename)
   
		for(var i=0;i<textFileSuffix.length;i++)
		{
			if(suffix==textFileSuffix[i])
			{
				return true
			}
		}
		return false
	}


	//查找文件是否在打开列表
	static isOpenFile(pathStr)
	{
		
		for(var i=0;i<openFilesArg.length;i++)
		{

			if(pathStr==File.restorePath('',openFilesArg[i].path))
			{
				
					return true
			}
		}
		
		return false
	}

	//工作状态切换
	static  workFilesSwitch(file){
		
		if(activeFile!=null){
			activeFile.stateDiv.className='files-state-item'
			activeFile.contentDiv.className='inner-inactive'
		}
		
		
		activeFile=file
		file.contentDiv.className='workspace-content'
		file.stateDiv.className='files-state-item-active'
	
		
	 }
   
	/**
	 * 实例对象属性定义
	 */
	constructor(path,isVisual)
	{
	

		this.path=path
		this.name=path[path.length-1]
		this.isVisual=isVisual
		this.stateDiv=null
		this.contentDiv=null
		this.idRecord=0;
		if(isVisual)
		{
			this.VMArg=new Array(101)	//文件二维平面坐标数组 ，初始定义100行
		
			for(var i=0;i<101;i++)
			{
				this.VMArg[i]=new Array(101)
			
			}
		}
	}

	 //创建可编辑文本内容框
	createTextContent(parentElem,content){
	
		this.contentDiv=document.createElement('div')
		var textContent=document.createElement('textarea')
	
		this.contentDiv.className='workspace-content'
		textContent.className='workspace-content-text'
		textContent.value=content
		this.text=textContent
		this.contentDiv.appendChild(textContent)
	
		parentElem.appendChild(this.contentDiv)
		return this.contentDiv
	 }
	
	 //创建可视化Content Div
	 createVisualContentDiv(parentElem,content)
	 {
		 this.contentDiv=document.createElement('div')
		 this.contentDiv.className='workspace-content'
 
		 parentElem.appendChild(this.contentDiv)
		 return this.contentDiv
		 
	 }
 
	 //创建文件打开状态栏
	createFileStateDiv(parentElem){

		var thisFile=this
		this.stateDiv=document.createElement('span')
		
		var text=document.createElement('span')
		var textNode=document.createTextNode(this.path[this.path.length-1])
		var close=document.createElement('span')
	
		text.appendChild(textNode)
		this.stateDiv.className='files-state-item'
		close.className='files-state-close'
		text.className='files-state-item-text'
	
		this.stateDiv.appendChild(text)
		this.stateDiv.appendChild(close)
		parentElem.appendChild(this.stateDiv)
	
		
		//关闭文件
		close.onclick=function()
		{
			
			//视图移除
			parentElem.removeChild(thisFile.stateDiv)
			workspace.removeChild(thisFile.contentDiv)

			var pathStr=File.restorePath('',thisFile.path)
			var index=0;
			
			for(var i=0;i<openFilesArg.length;i++)
			{
				if(pathStr==openFilesArg[i])
				{
					index=i
					break
				}
			}
	
			openFilesArg.splice(index,1)
			
		}
	
		//切换至工作状态  
		text.onclick=function(){
			File.workFilesSwitch(thisFile)
		}
	
		return this.stateDiv
	 }
  }