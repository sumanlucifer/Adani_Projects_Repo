sap.ui.define([], function () {
    "use strict";

    return {
        fileContent: function (sValue) {
            if (sValue) {
                if (sValue.includes(".csv") || sValue.includes(".CSV"))
                    return "data:text/csv;base64,";
                if (sValue.includes(".jpg") || sValue.includes(".JPG")) {
                    var decodedPdfContent = atob(sValue);
                    var byteArray = new Uint8Array(decodedPdfContent.length)
                    for (var i = 0; i < decodedPdfContent.length; i++) {
                        byteArray[i] = decodedPdfContent.charCodeAt(i);
                    }
                    var blob = new Blob([byteArray.buffer], { type: 'image/jpg' });
                    var _pdfurl = URL.createObjectURL(blob);
                    return _pdfurl;
                }
                if (sValue.includes(".jpeg") || sValue.includes(".JPEG")) {
                    var decodedPdfContent = atob(sValue);
                    var byteArray = new Uint8Array(decodedPdfContent.length)
                    for (var i = 0; i < decodedPdfContent.length; i++) {
                        byteArray[i] = decodedPdfContent.charCodeAt(i);
                    }
                    var blob = new Blob([byteArray.buffer], { type: 'image/jpeg' });
                    var _pdfurl = URL.createObjectURL(blob);
                    return _pdfurl;
                };
                if (sValue.includes(".pdf") || sValue.includes(".PDF")) {
                    var decodedPdfContent = atob(sValue);
                    var byteArray = new Uint8Array(decodedPdfContent.length)
                    for (var i = 0; i < decodedPdfContent.length; i++) {
                        byteArray[i] = decodedPdfContent.charCodeAt(i);
                    }
                    var blob = new Blob([byteArray.buffer], { type: 'application/pdf' });
                    var _pdfurl = URL.createObjectURL(blob);
                    return _pdfurl;
                }
            }
        }



    };

});