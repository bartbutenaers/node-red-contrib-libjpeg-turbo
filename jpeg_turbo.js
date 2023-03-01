/**
 * Copyright 2023 Bart Butenaers
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/
module.exports = function (RED) {
    const turbo = require('@julusian/jpeg-turbo');

    function JpegTurboNode(config) {
        RED.nodes.createNode(this, config);
        this.action          = config.action;
        this.image           = config.image;
        this.imageWidth      = config.imageWidth;
        this.imageWidthType  = config.imageWidthType;
        this.imageHeight     = config.imageHeight;
        this.imageHeightType = config.imageHeightType;
        this.format          = config.format;
        this.quality         = config.quality;
        this.subSampling     = config.subSampling;
        this.result          = config.result;

        var node = this;
        
        // Note that the jpeg-turbo npm module does not contain constants for all formats...
        node.formats = ["RGB", "BGR", "2", "BGRX", "XBGR", "XRGB", "GRAY", "7", "BGRA", "ABGR", "ARGB"];

        node.on("input", function(msg) {
            let inputImageBuffer, result, imageWidth, imageHeight;

            try {
                // Get the image buffer from the specified input message property.
                // In case of decoding this will be a jpeg image buffer, and in case of encoding a raw image buffer.
                inputImageBuffer = RED.util.getMessageProperty(msg, node.image);
            } 
            catch(err) {
            }

            if (!inputImageBuffer) {
                node.error("Cannot get the input image from msg." + node.image);
                return;
            }

            if (!Buffer.isBuffer(inputImageBuffer)) {
                node.error("Then msg." + node.image + " should contain a Buffer");
                return;
            }

            switch (node.action) {
                case "encode":
                    // The image width can be a hardcoded numeric value or an input property path
                    if (node.imageWidthType == "num") {
                        imageWidth = node.imageWidthType;
                    }
                    else {
                        try {
                            // Get the raw image buffer from the specified input message property
                            imageWidth = RED.util.getMessageProperty(msg, node.imageWidth);
                        }
                        catch(err) {
                        }

                        if (!imageWidth) {
                            node.error("Cannot get the input image width from msg." + node.imageWidth);
                            return;
                        }

                        if (!Number.isInteger(imageWidth)) {
                            node.error("The msg." + node.imageWidth + " should contain an integer number");
                            return;
                        }
                    }

                    // The image height can be a hardcoded numeric value or an input property path
                    if (node.imageHeightType == "num") {
                        imageHeight = node.imageHeightType;
                    }
                    else {
                        try {
                            // Get the raw image buffer from the specified input message property
                            imageHeight = RED.util.getMessageProperty(msg, node.imageHeight);
                        }
                        catch(err) {
                        }

                        if (!imageHeight) {
                            node.error("Cannot get the raw image height from msg." + node.imageHeight);
                            return;
                        }

                        if (!Number.isInteger(imageHeight)) {
                            node.error("The msg." + node.imageHeight + " should contain an integer number");
                            return;
                        }
                    }

                    let encodingOptions = {
                        format: turbo["FORMAT_" + node.format.toUpperCase()],
                        width: imageWidth,
                        height: imageHeight,
                        subsampling: turbo["SAMP_" + node.subSampling],
                        quality: node.quality
                    }

                    // Encode the raw input image
                    result = turbo.compressSync(inputImageBuffer, encodingOptions);
                    break;
                case "decode":
                    let decodingOptions = {
                        format: turbo["FORMAT_" + node.format.toUpperCase()],
                    }

                    // Decode the jpeg input image
                    result = turbo.decompressSync(inputImageBuffer, decodingOptions);
                    
                    // Map the numeric format to a label
                    result.format = node.formats[result.format];
                    
                    break;
            }

            try {
                // Send the result into the specified output message property.
                // In case of encoding that will be the jpeg image, and in case of encoding it will be an object (containing raw image, width, height, ...)
                RED.util.setMessageProperty(msg, node.result, result, true);
            } 
            catch(err) {
                node.error("Error sending the result in msg." + node.result + " : " + err.message);
                return;
            } 

            node.send(msg);
        });

        node.on("close", function () {
            node.status({});
        });
    }
    RED.nodes.registerType("jpeg-turbo", JpegTurboNode);
};
