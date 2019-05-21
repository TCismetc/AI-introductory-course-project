# AI-introductory-course-project
AI导论小组作业

### add_pic:
照片登记提交，先上传到add_pic文件夹    
命名格式： name.jpg or name.png

### data_base:
照片编码后的数据文件 和 名称文件   
pyn格式保存

### img:
从add_pic文件提交的照片 经过编码后保存到img文件  
收录了所有编码照片的原始照片文件

### 人脸检测.py
show():调用摄像头 开始人脸检测    
       二次改进，通过手机照相机局域网传输到电脑，实现了高清画面实时处理和展示  
load_info(path):给出提交图片的文件夹路径（add_pic路径），提交照片信息    
initial_info():根据img文件夹的图片 初始化data_base
