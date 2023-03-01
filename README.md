# node-red-contrib-libjpeg-turbo
A Node-RED node for fast encoding or decoding jpeg images via [libjpeg-turbo](https://libjpeg-turbo.org/).

## Install

Run the following npm command in your Node-RED user directory (typically ~/.node-red):
```
npm install node-red-contrib-libjpeg-turbo
```
Note that libjpeg-turbo is written in C, which means the library will be build on your system.  That happens automatically, but might give errors on some platforms.

## Support my Node-RED developments
Please buy my wife a coffee to keep her happy, while I am busy developing Node-RED stuff for you ...

<a href="https://www.buymeacoffee.com/bartbutenaers" target="_blank"><img src="https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png" alt="Buy my wife a coffee" style="height: 41px !important;width: 174px !important;box-shadow: 0px 3px 2px 0px rgba(190, 190, 190, 0.5) !important;-webkit-box-shadow: 0px 3px 2px 0px rgba(190, 190, 190, 0.5) !important;" ></a>

## Usage

The following example flow demonstrates how to decode a jpeg image (which is fetched from the internet) to raw image pixels.  Afterwards the raw image pixels are encoded again to be able to show the image via an [/node-red-contrib-image-output](https://github.com/rikukissa/node-red-contrib-image-output) node:

![image](https://user-images.githubusercontent.com/14224149/222207370-13563bab-912c-4cad-8ce1-6e2339ed6e78.png
```
[{"id":"4fc1d135ea3afdce","type":"jpeg-turbo","z":"5623aa0bb38bbf0e","name":"","action":"decode","image":"payload","imageWidth":"width","imageWidthType":"msg","imageHeight":"height","imageHeightType":"msg","result":"payload","format":"rgb","quality":75,"_mcu":{"mcu":false},"x":600,"y":720,"wires":[["1cc19e2ad40da870","1c944d8bf2b72c0c"]]},{"id":"63c466f35d9bf849","type":"image","z":"5623aa0bb38bbf0e","name":"","width":"640","data":"payload","dataType":"msg","thumbnail":false,"active":true,"pass":false,"outputs":0,"_mcu":{"mcu":false},"x":980,"y":720,"wires":[]},{"id":"1cc19e2ad40da870","type":"jpeg-turbo","z":"5623aa0bb38bbf0e","name":"","action":"encode","image":"payload.data","imageWidth":"payload.width","imageWidthType":"msg","imageHeight":"payload.height","imageHeightType":"msg","result":"payload","format":"rgb","quality":75,"subSampling":"420","_mcu":{"mcu":false},"x":780,"y":720,"wires":[["63c466f35d9bf849","60aaa75e1aeaf87c"]]},{"id":"895781f009ed6e25","type":"http request","z":"5623aa0bb38bbf0e","name":"","method":"GET","ret":"bin","paytoqs":"ignore","url":"https://images.unsplash.com/photo-1461800919507-79b16743b257?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80","tls":"","persist":false,"proxy":"","insecureHTTPParser":false,"authType":"","senderr":false,"headers":[],"_mcu":{"mcu":false},"x":410,"y":720,"wires":[["4fc1d135ea3afdce"]]},{"id":"217f2580604d135d","type":"inject","z":"5623aa0bb38bbf0e","name":"Get snapshot","props":[{"p":"payload"}],"repeat":"","crontab":"","once":false,"onceDelay":"10","topic":"","payload":"","payloadType":"date","_mcu":{"mcu":false},"x":210,"y":720,"wires":[["895781f009ed6e25"]]}]
```

### Decoding

The input message will contain a jpeg image buffer, which will be decompressed to a raw image pixels buffer that is sent in the output message.  The output message will contain the following fields:
+ data: the raw image buffer
+ size: the size of the image in bytes
+ width: the image width in pixels
+ height: the image height in pixels
+ format: the format of the raw pixel data (RGB, BGR, BGRX, XBGR, XRGB, GRAY, BGRA, ABGR, ARGB)

### Encoding
The input message will contain the raw pixel image buffer, and optionally the image width and height.  The width and height can also configured as fixed numbers in the config screen.  After compressing the pixel buffer, the jpeg image buffer will be send in the output message.

## Node properties

### Action
Specify which action needs to be executed on the input images:
+ *Decoding*: Decode the jpeg input image buffer to a raw image buffer.
+ *Encoding*: Encode the raw input image buffer to a jpeg image buffer.

### Width
In case of encoding, specify the width of the raw input image.  That width can be a fixed number, or be set dynamically via an input message field.

### Height
In case of encoding, specify the height of the raw input image.  That height can be a fixed number, or be set dynamically via an input message field.

### Sampling
In case of encoding, specify the chroma sub-sampling method by selecting one of the following most common combinations:

+ *4:2:0* for half the horizontal color resolution, and also half the vertical color resolution (2 chroma samples on the first row, and no chroma samples on the second row).  Each chroma sample is being used for 2 columns and for the row below.  Practically lossless visual quality is retained. 
+ *4:2:2* for half the horizontal color resolution, but full vertical color resolution (2 chroma samples on the first row, and 2 chroma samples on the second row).    Each chroma sample is being used for two columns.  The file size is one third of an uncompressed image, with little to no compression artifacts.  
+ *4:4:0* for a half of the vertical color resolution, but full horizontal color resolution (4 chroma samples on the first row and 0 chroma sample on the second row).  The chroma samples of the first row are also being reused for the second row.
+ *4:4:4* for an uncompressed signal without color reduction, i.e. full horizontal and vertical color resolution without quality loss (4 chroma samples on the first row and 4 chroma samples on the second row).
+ *GRAY* for grey scale images without any chroma.

![image](https://user-images.githubusercontent.com/14224149/222245580-46580a3c-ece2-4ad9-847f-22737d3f8c55.png)

Some background: The human eyes are far less sensitive to color changes than brightness changes.  As a result, it is better to reduce the amount of color information instead of reducing the luminance data (and still see a good quality image).luminance data instead. In other words, color components are sampled at a lower resolution than brightness to compress the image.  This is the reason why images are not using RGB code (i.e. a value of red, green and blue for every pixel), but instead YCbCr is used (i.e. Y for luminance and Cb and Cr for chroma color values).  Because by having separate chroma values, it is possible to store less chroma value samples.
### Quality
In case of encoding, specify the preferred quality of the jpeg output image (as a number between 0 and 100).

An image of 100% quality has almost no loss, and 1% quality is a very low quality image. In general, quality levels of 90% or higher are considered "high quality", 80%-90% is "medium quality", and 70%-80% is low quality

### Format
In case of decoding, specify the preferred format of the raw output image pixels (ARGB, BGRA, BGRX, GRAY, RGBA, RGBX, RGBR, XBGR, >XRGB, BGR, RGB).  See [here](https://gstreamer.freedesktop.org/documentation/additional/design/mediatype-video-raw.html?gi-language=c) for more detailed information.

### Result
Specify in which output message field the result data needs to be sent.
