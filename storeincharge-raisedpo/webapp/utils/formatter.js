sap.ui.define([
    "sap/ui/core/format/FileSizeFormat"
], function (FileSizeFormat) {
    "use strict";

    return {

        getPackingListStatusColor: function (status) {
            if (status === 'Saved')
                return 'Information';
            if (status === 'QR Code Generated')
                return 'Indication07';
            if (status === 'Sent for QR Code Approval')
                return 'Warning';
            if (status === 'Ready to Dispatch')
                return 'warning';
            if (status === 'Dispatch Initiated')
                return 'Success';
            if (status === 'Arrived')
                return 'Indication08';
            if (status === 'Received')
                return 'Success';
            else
                return 'Information';

        },

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
        },

        viewItemsVisible: function (oData) {

            if (oData) {
                if (oData.length > 0)
                    return true;
                else
                    return false;
            } else {
                return false;
            }
        },

        viewItemsFileUploader: function (oData) {

            if (oData) {
                if (oData.length > 0)
                    return false;
                else
                    return true;
            } else {
                return true;
            }
        },

        viewFileNames: function (oData) {

            if (oData) {
                if (oData.length > 0)
                    return true;
                else
                    return false;
            } else {
                return false;
            }
        },

        testFunction2: function (oData) {

            return true;
        },

        fileContent: function (fileName, fileContent) {

            if (fileName && fileContent) {
                var fileExtention = fileName.split(".")[1];
                if (fileExtention.includes("csv") || fileExtention.includes("CSV")) {
                    var decodedPdfContent = atob(fileContent);
                    var byteArray = new Uint8Array(decodedPdfContent.length)
                    for (var i = 0; i < decodedPdfContent.length; i++) {
                        byteArray[i] = decodedPdfContent.charCodeAt(i);
                    }
                    var blob = new Blob([byteArray.buffer], { type: 'text/csv' });
                    var _pdfurl = URL.createObjectURL(blob);
                    return _pdfurl;
                }
                if (fileExtention.includes("jpg") || fileExtention.includes("JPG")) {
                    var decodedPdfContent = atob(fileContent);
                    var byteArray = new Uint8Array(decodedPdfContent.length)
                    for (var i = 0; i < decodedPdfContent.length; i++) {
                        byteArray[i] = decodedPdfContent.charCodeAt(i);
                    }
                    var blob = new Blob([byteArray.buffer], { type: 'image/jpg' });
                    var _pdfurl = URL.createObjectURL(blob);
                    return _pdfurl;
                }
                if (fileExtention.includes("png") || fileExtention.includes("PNG")) {
                    var decodedPdfContent = atob(fileContent);
                    var byteArray = new Uint8Array(decodedPdfContent.length)
                    for (var i = 0; i < decodedPdfContent.length; i++) {
                        byteArray[i] = decodedPdfContent.charCodeAt(i);
                    }
                    var blob = new Blob([byteArray.buffer], { type: 'image/png' });
                    var _pdfurl = URL.createObjectURL(blob);
                    return _pdfurl;
                }
                if (fileExtention.includes("jpeg") || fileExtention.includes("JPEG")) {
                    var decodedPdfContent = atob(fileContent);
                    var byteArray = new Uint8Array(decodedPdfContent.length)
                    for (var i = 0; i < decodedPdfContent.length; i++) {
                        byteArray[i] = decodedPdfContent.charCodeAt(i);
                    }
                    var blob = new Blob([byteArray.buffer], { type: 'image/jpeg' });
                    var _pdfurl = URL.createObjectURL(blob);
                    return _pdfurl;
                };
                if (fileExtention.includes("pdf") || fileExtention.includes("PDF")) {
                    var decodedPdfContent = atob(fileContent);
                    var byteArray = new Uint8Array(decodedPdfContent.length)
                    for (var i = 0; i < decodedPdfContent.length; i++) {
                        byteArray[i] = decodedPdfContent.charCodeAt(i);
                    }
                    var blob = new Blob([byteArray.buffer], { type: 'application/pdf' });
                    var _pdfurl = URL.createObjectURL(blob);
                    return _pdfurl;
                }
            }
        },

        onDateConvert: function (oDate) {
            var date = new Date(oDate);

            return date.toDateString();
        },

        formatFileSize: function (sValue) {
            if (jQuery.isNumeric(sValue)) {
                return FileSizeFormat.getInstance({
                    binaryFilesize: false,
                    maxFractionDigits: 1,
                    maxIntegerDigits: 3
                }).format(sValue);
            } else {
                return sValue;
            }
        }

        // viewRequestGRN: function (data) {
            // this.MainModel.metadataLoaded(true).then(
            //     function () {
            //         debugger;
            //         // model is ready now
            //         // PONumber = that.getView().getBindingContext().getObject().PONumber;
            //         // mBindingParams.filters.push(new sap.ui.model.Filter("PONumber", sap.ui.model.FilterOperator.EQ, PONumber));
            //         // mBindingParams.sorter.push(new sap.ui.model.Sorter("CreatedAt", true));
            //     },
            //     function () {
            //         //Error Handler Display error information so that the user knows that the application does not work.
            //     });

            // visible="{path:'/', formatter:'.formatter.viewRequestGRN'}"
        // }

    };

});