
# coding: utf-8

# In[7]:

from PIL import Image,ImageDraw,ImageFont
import cv2
from face_recognition import face_locations,face_encodings,compare_faces,face_distance,load_image_file
import os
import numpy as np
import shutil
import sys


# In[8]:

def change_cv2_draw(image,strs,local,sizes,colour):
    cv2img = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    pilimg = Image.fromarray(cv2img)
    draw = ImageDraw.Draw(pilimg)  # 图片上打印
    font = ImageFont.truetype("SIMYOU.TTF",sizes, encoding="utf-8")
    draw.text(local, strs, colour, font=font)
    image = cv2.cvtColor(np.array(pilimg), cv2.COLOR_RGB2BGR)
    return image


# In[13]:

def show():
    #video_capture = cv2.VideoCapture(0)
    path_video="http://admin:admin@192.168.43.249:8081/"
    video_capture =cv2.VideoCapture(path_video)
    known_face_encodings=np.load('data_base/persons_encoding.npy')
    known_face_names=np.load('data_base/persons_name.npy')

    # Initialize some variables
    face_locationss = []
    face_encodingss = []
    face_names = []
    process_this_frame = True

    count=0
    interval=3

    while True:
        count+=1
        # Grab a single frame of video
        ret, frame = video_capture.read(0)

        # Resize frame of video to 1/4 size for faster face recognition processing
        #print(frame)
        if frame is not None:
            small_frame = cv2.resize(frame, (0, 0), fx=0.25, fy=0.25)

        # Convert the image from BGR color (which OpenCV uses) to RGB color (which face_recognition uses)
            rgb_small_frame = small_frame[:, :, ::-1]

        #else:
        #   rgb_small_frame=frame

        # Only process every other frame of video to save time
        if process_this_frame:
            # Find all the faces and face encodings in the current frame of video
            face_locationss = face_locations(rgb_small_frame)
            face_encodingss = face_encodings(rgb_small_frame, face_locationss)

            face_names = []
            for face_encoding in face_encodingss:
                # See if the face is a match for the known face(s)
                matches = compare_faces(known_face_encodings, face_encoding)
                name = "Unknown"

                # # If a match was found in known_face_encodings, just use the first one.
                # if True in matches:
                #     first_match_index = matches.index(True)
                #     name = known_face_names[first_match_index]

                # Or instead, use the known face with the smallest distance to the new face
                face_distancess = face_distance(known_face_encodings, face_encoding)
                best_match_index = np.argmin(face_distancess)
                if matches[best_match_index]:
                    name = known_face_names[best_match_index]

                face_names.append(name)
            process_this_frame=False
        if (count%interval)==0:
            process_this_frame = True


        # Display the results
        img=frame
        for (top, right, bottom, left), name in zip(face_locationss, face_names):
            # Scale back up face locations since the frame we detected in was scaled to 1/4 size
            top *= 4
            right *= 4
            bottom *= 4
            left *= 4

            # Draw a box around the face
            cv2.rectangle(img, (left, top), (right, bottom), (0, 0, 255), 2)

            # Draw a label with a name below the face
            cv2.rectangle(img, (left, bottom - 35), (right, bottom), (0, 0, 255), cv2.FILLED)
            #font = cv2.FONT_HERSHEY_DUPLEX
            #cv2.putText(frame, name, (left + 6, bottom - 6), font, 1.0, (255, 255, 255), 1)
            if frame is not None:
                img=change_cv2_draw(img,name,(left + 60, bottom-30 ),25,'black')
        # Display the resulting image
        cv2.imshow('Video',img)
        path_pic='middle_pic\\'+str(count)+'.jpg'
        cv2.imwrite(path_pic,img)

        # Hit 'q' on the keyboard to quit!
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    # Release handle to the webcam
    video_capture.release()
    cv2.destroyAllWindows()


# In[14]:

def load_info(path="add_pic"):
    #path  模型数据图片目录
    encodings=np.load('data_base/persons_encoding.npy')
    names=np.load('data_base/persons_name.npy')
    #总的样本都是以列表的形式存在的
    total_image_name = []
    total_face_encoding = []
    for fn in os.listdir(path):  #fn 表示的是文件名q listdir 返回文件列表 包括文件夹
        full_path=path + "/" + fn
        newpos='img/'+fn
        print(full_path)
        total_face_encoding.append(
            #encoding 返回一个np.array（face1,face2） 每一张脸是一个128维（元素）组成的数组
            #encodings()[0] 表示选取该图片中 最有可能为脸的一个编码了的位置
            face_encodings(
                #load_image_file 直接出来三通道RGB 
                load_image_file(full_path))[0])
        fn = fn[:(len(fn) - 4)]  #截取图片名（这里应该把images文件中的图片名命名为为人物名）
        total_image_name.append(fn)  #图片名字列表
        shutil.move(full_path,newpos)
    encoding1=np.array(total_face_encoding)
    name1=np.array(total_image_name)
    np.save('data_base/persons_encoding',np.r_[encodings,encoding1])
    np.save('data_base/persons_name',np.r_[names,name1])


# In[15]:

def initial_info():
    path = "img"  # 模型数据图片目录
    #cap = cv2.VideoCapture(0)
    #总的样本都是以列表的形式存在的
    total_image_name = []
    total_face_encoding = []
    for fn in os.listdir(path):  #fn 表示的是文件名q listdir 返回文件列表 包括文件夹
        print(path + "/" + fn)
        total_face_encoding.append(
            #encoding 返回一个np.array（face1,face2） 每一张脸是一个128维（元素）组成的数组
            #encodings()[0] 表示选取该图片中 最有可能为脸的一个编码了的位置
            face_encodings(
                #load_image_file 直接出来三通道RGB 
                load_image_file(path + "/" + fn))[0])
        fn = fn[:(len(fn) - 4)]  #截取图片名（这里应该把images文件中的图片名命名为为人物名）
        total_image_name.append(fn)  #图片名字列表
    np.save('data_base/persons_encoding',total_face_encoding)
    np.save('data_base/persons_name',total_image_name)


# In[17]:

show()


# In[ ]:



