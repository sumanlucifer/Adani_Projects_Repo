sap.ui.define([
    "./BaseController",
    "sap/ui/core/Fragment",
    "sap/ui/Device",
    "sap/ui/model/json/JSONModel",
    // 'sap/m/Token',
    // 'sap/m/ColumnListItem',
    // 'sap/m/Label',
    'sap/m/MessageBox',
    '../utils/formatter',
    "sap/m/PDFViewer",
    'sap/ui/model/Filter',
    'sap/ui/model/FilterOperator',
], function (BaseController, Fragment, Device, JSONModel, MessageBox, formatter, PDFViewer, Filter, FilterOperator) {
    "use strict";
    return BaseController.extend("com.agel.mmts.vendorpackinglistcreate.controller.PackingListDetails", {
        formatter: formatter,
        onInit: function () {
            jQuery.sap.addUrlWhitelist("blob");
            this.mainModel = this.getOwnerComponent().getModel();
            //Router Object
            this.oRouter = this.getOwnerComponent().getRouter();
            this.oRouter.getRoute("RoutePackingListDetails").attachPatternMatched(this._onObjectMatched, this);
            //view model instatiation
            var oViewModel = new JSONModel({
                busy: false,
                delay: 0,
                isPackagingTableVisible: false,
                isPackingListInEditMode: false,
                isOuterPackagingRequired: true
            });
            this.setModel(oViewModel, "objectViewModel");
            this.getViewModel("objectViewModel").setProperty("/serviceUrl",  this.mainModel.sServiceUrl);
        },
        _onObjectMatched: function (oEvent) {
            var objectViewModel = this.getViewModel("objectViewModel");
            this.packingListId = oEvent.getParameter("arguments").packingListId;
            var that = this;
            //  this.packingListId = "62";
            this.getView().bindElement({
                path: "/PackingListSet(" + this.packingListId + ")",
                events: {
                    dataRequested: function () {
                        objectViewModel.setProperty("/busy", true);
                    },
                    dataReceived: function () {
                        var bIsProcessTwoCompletes = this.getBoundContext().getObject().IsProcessTwoCompletes;
                        var bIsOuterPackagingRequired = this.getBoundContext().getObject().IsOuterPackagingRequired;
                        if (!bIsOuterPackagingRequired.length)
                            objectViewModel.setProperty("/isOuterPackagingRequired", true);
                        if (bIsProcessTwoCompletes)
                            objectViewModel.setProperty("/isPackingListInEditMode", false);
                        else
                            objectViewModel.setProperty("/isPackingListInEditMode", true);
                        objectViewModel.setProperty("/busy", false);
                        // var documentResult = that.getDocumentData();
                        // documentResult.then(function (result) {
                        //     that.PrintDocumentService(result);
                        // });
                    }
                }
            });
            // this._getPackingListOuterPackagingData();
            // this._getPackingListInnerPackagingData();
            // this._createAdditionalDetailsModel();
        },
        // getDocumentData: function () {
        //     var promise = jQuery.Deferred();
        //     this.getViewModel("objectViewModel").setProperty(
        //         "/busy",
        //         true
        //     );
        //     var that = this;
          
        //     var oView = this.getView();
        //     var oDataModel = oView.getModel();
        //     //console.log(oPayLoad);
        //     return new Promise((resolve, reject) => {
        //         this.getOwnerComponent().getModel().read("/PackingListSet(" + this.packingListId + ")/Attachments", {
        //             success: function (oData, oResponse) {
        //                 this.getViewModel("objectViewModel").setProperty(
        //                     "/busy",
        //                     false
        //                 );
        //                 var oJSONData = {
        //                     PL_Material: [],
        //                     PL_Invoice: [],
        //                     PL_Others: []
        //                 };
        //                 // oData.results.forEach((oItem) => {
        //                 //     if(oItem.Type === 'PACKING_LIST' && oItem.SubType === 'MATERIAL' )
        //                 //         oJSONData.PL_Material.push(oItem);
        //                 //     else if(oItem.Type === 'PACKING_LIST' && oItem.SubType === 'INVOICE' )
        //                 //         oJSONData.PL_Invoice.push(oItem);
        //                 //     else if(oItem.Type === 'PACKING_LIST' && oItem.SubType === 'OTHERS' )
        //                 //         oJSONData.PL_Others.push(oItem);
        //                 // } );
        //                 var DocumentModel = new JSONModel(oJSONData);
        //                 that.getView().setModel(DocumentModel, "DocumentModel");
        //                 resolve(oData.results);
        //             }.bind(this),
        //             error: function (oError) {
        //                 this.getViewModel("objectViewModel").setProperty(
        //                     "/busy",
        //                     false
        //                 );
        //                // sap.m.MessageBox.error(JSON.stringify(oError));
        //             }
        //         });
        //     });
        // },
        // PrintDocumentService: function (result) {
        //     var that = this;
        //     var oView = this.getView();
        //     var oDataModel = oView.getModel();
        //     var aRequestID = result.map(function (item) {
        //         return {
        //             RequestNo: item.RequestNo
        //         };
        //     });
        //     that.aResponsePayload = [];
        //     aRequestID.forEach((reqID) => {
        //         that.aResponsePayload.push(that.callPrintDocumentService(reqID))
        //     })
        //     result.forEach((item) => {
        //         var sContent = that.callPrintDocumentService({
        //             RequestNo: item.RequestNo
        //         })
        //         sContent.then(function (oVal) {
        //             item.Content = oVal.Bytes;
        //             debugger;
        //             if (item.Type === 'PACKING_LIST' && item.SubType === 'MATERIAL')
        //                 that.getViewModel("DocumentModel").getProperty("/PL_Material").push(item);
        //             else if (item.Type === 'PACKING_LIST' && item.SubType === 'INVOICE')
        //                 that.getViewModel("DocumentModel").getProperty("/PL_Invoice").push(item);
        //             else if (item.Type === 'PACKING_LIST' && item.SubType === 'OTHERS')
        //                 that.getViewModel("DocumentModel").getProperty("/PL_Others").push(item);

        //             that.getViewModel("DocumentModel").refresh();
        //         });
        //     });
        // },
        // callPrintDocumentService: function (reqID) {
        //     var promise = jQuery.Deferred();
        //     var othat = this;
            
        //     var oView = this.getView();
        //     var oDataModel = oView.getModel();
        //     //console.log(oPayLoad);
        //     // reqID.RequestNo = 'REQ00001'                  // For testing only, Comment for production
        //     return new Promise((resolve, reject) => {
        //         oDataModel.create("/PrintDocumentEdmSet", reqID, {
        //             success: function (data) {
        //                 // debugger;
        //                 resolve(data);
        //             },
        //             error: function (data) {
        //                 reject(data);
        //             },
        //         });
        //     });
        // },
        onViewQRCode: function () {
            this.selectedQRCodeObject = oEvent.getSource().getBindingContext("QRCodeModel").getObject();
            var oButton = oEvent.getSource(),
                oView = this.getView();
            if (!this._pDialog) {
                this._pDialog = Fragment.load({
                    id: oView.getId(),
                    name: "com.agel.mmts.vendorpackinglistcreate.view.fragments.packingListDetails.ValueHelpDialog",
                    controller: this
                }).then(function (oDialog) {
                    oView.addDependent(oDialog);
                    if (Device.system.desktop) {
                        oDialog.addStyleClass("sapUiSizeCompact");
                    }
                    return oDialog;
                });
            }
            this._pDialog.then(function (oDialog) {
                //this._configDialog(oButton, oDialog);
                oDialog.open();
            }.bind(this));
        },
        onDownloadPackingListPress: function (oEvent) {
            this.getViewModel("objectViewModel").setProperty(
                "/busy",
                true
            );
            var oPayload = {
                "PackingListId": this.getView().getBindingContext().getObject().ID
            };
            this.mainModel.create("/DownloadQRCodeSet", oPayload, {
                success: function (oData, oResults) {
                    this.getViewModel("objectViewModel").setProperty(
                        "/busy",
                        false
                    );
                    var base64Data = oData.Base64String;
                    if (base64Data)
                        this._openPDFDownloadWindow(base64Data);
                }.bind(this), error: function (oError) {
                    this.getViewModel("objectViewModel").setProperty(
                        "/busy",
                        false
                    );
                    // sap.m.MessageBox.error(JSON.parse(oError));
                }.bind(this),
            });
        },
        _openPDFDownloadWindow: function (base64Data) {
            var _pdfViewer = new PDFViewer();
            this.getView().addDependent(_pdfViewer);
            var decodedPdfContent = atob(base64Data);
            var byteArray = new Uint8Array(decodedPdfContent.length)
            for (var i = 0; i < decodedPdfContent.length; i++) {
                byteArray[i] = decodedPdfContent.charCodeAt(i);
            }
            var blob = new Blob([byteArray.buffer], { type: 'application/pdf' });
            var _pdfurl = URL.createObjectURL(blob);
            _pdfViewer.setSource(_pdfurl);
            if (Device.system.desktop) {
                _pdfViewer.addStyleClass("sapUiSizeCompact");
            }
            _pdfViewer.setTitle("Packing List " + this.getView().getBindingContext().getObject().Name);
            _pdfViewer.setShowDownloadButton(false);
            _pdfViewer.open();
        },
        onMarkConsignmentAsDispatched: function (oEvent) {
            //initialize the action
            var oModel = new JSONModel({
                "weight": null,
                "QRNumber": null,
                "isQRConfirmed": false,
                "isValidateButtonEnabled": false,
                "valueState": "None",
                "valueStateText": "",
                "isDispatchButtonEnabled": false
            });
            this.getView().setModel(oModel, "packingListDispatchModel")
            if (!this._oPackingListDispatchDialog) {
                this._oPackingListDispatchDialog = sap.ui.xmlfragment("com.agel.mmts.vendorpackinglistcreate.view.fragments.packingListDetails.PackingListWeightGetter", this);
                this.getView().addDependent(this._oPackingListDispatchDialog);
            }
            if (Device.system.desktop) {
                this._oPackingListDispatchDialog.addStyleClass("sapUiSizeCompact");
            }
            this._oPackingListDispatchDialog.open();
        },
        onCloseDispatchDialogPress: function (oEvent) {
            this._oPackingListDispatchDialog.close();
        },
        onNeedQRPrintingAsistancePress: function (oEvent) {
            //initialize the action
            var oModel = new JSONModel({
                "reason": null,
                "comment": null
            });
            this.getView().setModel(oModel, "qrAssistantModel")
            if (!this._oQRAssistantDialog) {
                this._oQRAssistantDialog = sap.ui.xmlfragment("com.agel.mmts.vendorpackinglistcreate.view.fragments.packingListDetails.QRassistant", this);
                this.getView().addDependent(this._oQRAssistantDialog);
            }
            this._oQRAssistantDialog.open();
        },
        onSendAssistanceRequestPress: function (oEvent) {
            this.getViewModel("objectViewModel").setProperty(
                "/busy",
                true
            );
            var inputModel = this.getView().getModel("qrAssistantModel");
            var flag = 0;
            if (inputModel.getProperty("/comment") == null || inputModel.getProperty("/comment") == "") {
                flag = 1;
            }
            if (inputModel.getProperty("/reason") == null || inputModel.getProperty("/reason") == "") {
                flag = 1;
                // this.byId("idSelReason").setValueState("Error");
            }
            if (flag == 1) {
                sap.m.MessageBox.error("Please fill mandatory fields");
                return 0;
            }
            var oPayload = {
                "PackingListId": this.getView().getBindingContext().getObject().ID,
                "VendorCode": this.byId("idObjVendorCode").getBindingContext().getObject().VendorCode,
                //  "UserName": "Venkatesh.hulekal@extentia.com",
                "Description": inputModel.getProperty("/comment"),
                "Reason": inputModel.getProperty("/reason")
            };
            this.mainModel.create("/VendorQRPrintingRequestSet", oPayload, {
                success: function (oData, oResults) {
                    this.getViewModel("objectViewModel").setProperty(
                        "/busy",
                        false
                    );
                    if (oData.Success) {
                        sap.m.MessageBox.success("Request for QR printing sent successfully!")
                        this._oQRAssistantDialog.close();
                        this.byId("idHeader").getModel().refresh();
                    }
                    else {
                        MessageBox.error(oData.Message);
                    }
                }.bind(this), error: function (oError) {
                    this.getViewModel("objectViewModel").setProperty(
                        "/busy",
                        false
                    );
                    // sap.m.MessageBox.error(JSON.parse(oError));
                }.bind(this),
            });
        },
        onCancelAssistanceRequestPress: function (oEvent) {
            this._oQRAssistantDialog.close();
        },
        onWeightLiveChange: function (oEvent) {
            if (oEvent.getSource().getValue().length)
                this.getViewModel("packingListDispatchModel").setProperty("/isDispatchButtonEnabled", true);
            else
                this.getViewModel("packingListDispatchModel").setProperty("/isDispatchButtonEnabled", false);
        },
        onQRLiveChange: function (oEvent) {
            if (oEvent.getSource().getValue().length)
                this.getViewModel("packingListDispatchModel").setProperty("/isValidateButtonEnabled", true);
            else
                this.getViewModel("packingListDispatchModel").setProperty("/isValidateButtonEnabled", false);
        },
        onDispatchPackingListPress: function (oEvent) {
            this.getViewModel("objectViewModel").setProperty(
                "/busy",
                true
            );
            var oPayload = {
                "PackingListId": this.getView().getBindingContext().getObject().ID,
                "TotalWeight": this.getViewModel("packingListDispatchModel").getProperty("/weight"),
                "UserName": "Agel"
            };
            this.mainModel.create("/UpdatePackingListStatusSet", oPayload, {
                success: function (oData, oResults) {
                    this.getViewModel("objectViewModel").setProperty(
                        "/busy",
                        false
                    );
                    sap.m.MessageBox.success("Packing list has been dispatched successfully!")
                    this.byId("idHeader").getModel().refresh();
                    this._oPackingListDispatchDialog.close();
                }.bind(this), error: function (oError) {
                    this.getViewModel("objectViewModel").setProperty(
                        "/busy",
                        false
                    );
                    // sap.m.MessageBox.error(JSON.parse(oError));
                }.bind(this),
            });
        },

        //scannner related functions
        onScanSuccess: function (oEvent) {
            if (oEvent.getParameter("cancelled")) {
                sap.m.MessageToast.show("Scan cancelled", { duration: 1000 });
            } else {
                var sScannedValue = oEvent.getParameter("text");
                if (sScannedValue.length > 0) {
                    var isValid = this.checkForValidJSON(sScannedValue);
                    if (isValid) {
                        sap.m.MessageToast.show("Successfully scanned: " + JSON.parse(JSON.parse(sScannedValue)).QRNumber);
                        this.getViewModel("packingListDispatchModel").setProperty("/QRNumber", JSON.parse(JSON.parse(sScannedValue)).QRNumber);
                        this.onValidateQRPress();
                    } else {
                        sap.m.MessageBox.error("Not a valid QR! Please try again with a different QR code.")
                    }
                }
            }
        },

        onScanError: function (oEvent) {
            sap.m.MessageToast.show("Scan failed" + oEvent, { duration: 1000 });
        },

        checkForValidJSON: function (sScannedValue) {
            try {
                return (JSON.parse(JSON.parse(sScannedValue)) && !!sScannedValue);
            } catch (e) {
                return false;
            }
        },

        onValidateQRPress: function (oEvent) {
            this.getViewModel("objectViewModel").setProperty(
                "/busy",
                true
            );
            var sPackingListPath = this.getView().getBindingContext().getPath();
            var sPathToCheck = sPackingListPath + "/QRCodeId";
            this.mainModel.read(sPathToCheck, {
                filters: [new Filter({
                    path: "QRNumber",
                    operator: FilterOperator.EQ,
                    value1: this.getViewModel("packingListDispatchModel").getProperty("/QRNumber")
                }),
                new Filter({
                    path: "Type",
                    operator: FilterOperator.EQ,
                    value1: "PACKINGLIST"
                })
                ],
                success: function (oData, oResults) {
                    this.getViewModel("objectViewModel").setProperty(
                        "/busy",
                        false
                    );
                    if (oData.results.length) {
                        this.getViewModel("packingListDispatchModel").setProperty("/isQRConfirmed", true);
                        this.getViewModel("packingListDispatchModel").setProperty("/isValidateButtonEnabled", true);
                        this.getViewModel("packingListDispatchModel").setProperty("/valueState", "None");
                        this.getViewModel("packingListDispatchModel").setProperty("/valueStateText", "");
                    } else {
                        //sap.m.MessageBox.error("QR code did not match. Please enter a valid QR number to proceed with disaptchment.");
                        this.getViewModel("packingListDispatchModel").setProperty("/isQRConfirmed", false);
                        this.getViewModel("packingListDispatchModel").setProperty("/valueState", "Error");
                        this.getViewModel("packingListDispatchModel").setProperty("/valueStateText", "QR code did not match. Please enter a valid QR number to proceed with disaptchment.");
                        // this.getViewModel("packingListDispatchModel").setProperty("/isValidateButtonEnabled", false);
                    }
                }.bind(this), error: function (oError) {
                    this.getViewModel("objectViewModel").setProperty(
                        "/busy",
                        false
                    );
                    // sap.m.MessageBox.error(JSON.parse(oError));
                }.bind(this),
            });
        },
        // onViewQRCodePress: function (oEvent) {
        //     var sParentItemPath = oEvent.mParameters.getSource().getBindingContext().getPath();
        //     var sDialogTitleObject = oEvent.mParameters.getSource().getParent().getBindingContext().getObject();
        //     var oDetails = {};
        //     oDetails.controller = this;
        //     oDetails.view = this.getView();
        //     oDetails.sParentItemPath = sParentItemPath;
        //     oDetails.title = "QR Code";
        //     if (sDialogTitleObject.Name)
        //         oDetails.title = sDialogTitleObject.Name;
        //     else if (sDialogTitleObject.PackagingType)
        //         oDetails.title = sDialogTitleObject.PackagingType;
        //     if (!this.qrDialog) {
        //         this.qrDialog = Fragment.load({
        //             id: oDetails.view.getId(),
        //             name: "com.agel.mmts.vendorpackinglistcreate.view.fragments.packingListDetails.QRCodeViewer",
        //             controller: oDetails.controller
        //         }).then(function (oDialog) {
        //             // connect dialog to the root view of this component (models, lifecycle)
        //             oDetails.view.addDependent(oDialog);
        //             oDialog.bindElement({
        //                 path: oDetails.sParentItemPath,
        //             });
        //             if (Device.system.desktop) {
        //                 oDialog.addStyleClass("sapUiSizeCompact");
        //             }
        //             oDialog.setTitle(oDetails.title);
        //             return oDialog;
        //         });
        //     }
        //     this.qrDialog.then(function (oDialog) {
        //         oDetails.view.addDependent(oDialog);
        //         oDialog.bindElement({
        //             path: oDetails.sParentItemPath,
        //         });
        //         oDialog.setTitle(oDetails.title);
        //         oDialog.open();
        //     });
        // },
        onViewQRCodePress: function (oEvent) {
            this.getViewModel("objectViewModel").setProperty(
                "/busy",
                true
            );
            var qrcodeID = this.byId("idQRNumber").getText();
            var qrcodeID = oEvent.mParameters.getSource().getBindingContext().getObject().QRNumber;
            var aPayload = {
                "QRNumber": qrcodeID,
                "RegeneratedQRId": 0
            };
            this.getComponentModel().create("/QuickAccessQRCodeEdmSet", aPayload, {
                success: function (oData, oResponse) {
                    this.getViewModel("objectViewModel").setProperty(
                        "/busy",
                        false
                    );
                    if (oData.Success) {
                        // sap.m.MessageBox.success(oData.Message);
                        this._openPDFDownloadWindow(oData.Base64String);
                    }
                    else {
                        sap.m.MessageBox.error("QR Code is wrong");
                    }
                    this.getComponentModel().refresh();
                }.bind(this),
                error: function (oError) {
                    this.getViewModel("objectViewModel").setProperty(
                        "/busy",
                        false
                    );
                    // sap.m.MessageBox.success(JSON.stringify(oError));
                }.bind(this),
            })
        },
        _openPDFDownloadWindow: function (base64Data) {
            var _pdfViewer = new PDFViewer();
            this.getView().addDependent(_pdfViewer);
            var decodedPdfContent = atob(base64Data);
            var byteArray = new Uint8Array(decodedPdfContent.length)
            for (var i = 0; i < decodedPdfContent.length; i++) {
                byteArray[i] = decodedPdfContent.charCodeAt(i);
            }
            var blob = new Blob([byteArray.buffer], { type: 'application/pdf' });
            var _pdfurl = URL.createObjectURL(blob);
            _pdfViewer.setSource(_pdfurl);
            if (Device.system.desktop) {
                _pdfViewer.addStyleClass("sapUiSizeCompact");
            }
            // _pdfViewer.setTitle("QR Code " + this.getView().getBindingContext().getObject().Name);
            _pdfViewer.setTitle("QR Code");
            _pdfViewer.setShowDownloadButton(false);
            _pdfViewer.open();
        },
        onQRCodeViewerDialogClosePress: function (oEvent) {
            this.qrDialog.then(function (oDialog) {
                oDialog.close();
            });
        }
    });
}
);