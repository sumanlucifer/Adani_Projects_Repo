sap.ui.define([], function () {
    "use strict";

    return {

        getSampleFileURL: function (file) {
            var base64EncodeContent = "TElORV9JVEVNX0lELE1BVEVSSUFMX0NPREUsREVTQ1JJUFRJT04sUVVBTlRJVFksVU9NLENPTU1FTlRTLFBBUkVOVF9JVEVNX0lECjEyMDAxNCxDLTY3NTgsVGVzdCBNYXRlcmlhbCwxMDAsZWFjaCxDb21tZW50cywxMjAwMTQK";
            var decodedPdfContent = atob(base64EncodeContent);
            var byteArray = new Uint8Array(decodedPdfContent.length)
            for (var i = 0; i < decodedPdfContent.length; i++) {
                byteArray[i] = decodedPdfContent.charCodeAt(i);
            }
            var blob = new Blob([byteArray.buffer], { type: 'text/csv' });
            var _url = URL.createObjectURL(blob);
            return _url;
        }

    };

});