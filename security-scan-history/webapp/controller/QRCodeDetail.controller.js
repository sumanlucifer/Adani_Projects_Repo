sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/Fragment",
    "sap/ui/model/Sorter",
    "sap/ui/Device",
    "sap/ui/core/routing/History",
    'sap/m/ColumnListItem',
    'sap/m/Input',
    "jquery.sap.global",
    "../utils/formatter",
    "sap/m/PDFViewer"

],
	/**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (BaseController, JSONModel, Filter, FilterOperator, Fragment, Sorter, Device, History, ColumnListItem, Input, jquery, formatter, PDFViewer) {
        "use strict";
        return BaseController.extend("com.agel.mmts.securityscanhistory.controller.QRCodeDetail", {
            formatter: formatter,

            onInit: function () {
                jquery.sap.addUrlWhitelist("blob");
                //view model instatiation
                var oViewModel = new JSONModel({
                    busy: false,
                    delay: 0
                });
                this.setModel(oViewModel, "objectViewModel");

                var oViewHandlingModel = new JSONModel({
                    "EnterVehicleNo": null,
                    "ReEnterVehicleNo": null,
                    //     HeaderDeclineButton : false
                    "wantChange": false

                });
                this.setModel(oViewHandlingModel, "oViewHandlingModel");

                // Main Model Set
                this.MainModel = this.getComponentModel();
                this.getView().setModel(this.MainModel);

                //Router Object
                this.oRouter = this.getRouter();
                this.oRouter.getRoute("RouteQRCodeDetail").attachPatternMatched(this._onObjectMatched, this);
            },

            // On Object Matched 
            _onObjectMatched: function (oEvent) {
                //   this.packingListId = 5;
                this.packingListId = oEvent.getParameter("arguments").QRNo;
                this._bindView("/PackingListSet(" + this.packingListId + ")");

            },

            // View Level Binding
            _bindView: function (sObjectPath) {
                var that = this;
                var objectViewModel = this.getViewModel("objectViewModel");

                this.getView().bindElement({
                    path: sObjectPath,
                    events: {
                        dataRequested: function () {
                            objectViewModel.setProperty("/busy", true);
                        },
                        dataReceived: function () {
                            objectViewModel.setProperty("/busy", false);
                            var documentResult = that.getDocumentData();
                            documentResult.then(function (result) {
                                that.PrintDocumentService(result);
                            });
                        }
                    }
                });
            },
            getDocumentData: function () {
                var promise = jQuery.Deferred();
                var that = this;
                var oView = this.getView();
                var oDataModel = oView.getModel();
                //console.log(oPayLoad);
                return new Promise((resolve, reject) => {
                    this.getOwnerComponent().getModel().read("/PackingListSet(" + this.packingListId + ")/Attachments", {
                        success: function (oData, oResponse) {
                            var oJSONData = {
                                PL_Material: [],
                                PL_Invoice: [],
                                PL_Others: []
                            };
                            // oData.results.forEach((oItem) => {
                            //     if(oItem.Type === 'PACKING_LIST' && oItem.SubType === 'MATERIAL' )
                            //         oJSONData.PL_Material.push(oItem);
                            //     else if(oItem.Type === 'PACKING_LIST' && oItem.SubType === 'INVOICE' )
                            //         oJSONData.PL_Invoice.push(oItem);
                            //     else if(oItem.Type === 'PACKING_LIST' && oItem.SubType === 'OTHERS' )
                            //         oJSONData.PL_Others.push(oItem);
                            // } );
                            var DocumentModel = new JSONModel(oJSONData);
                            that.getView().setModel(DocumentModel, "DocumentModel");
                            resolve(oData.results);
                        }.bind(this),
                        error: function (oError) {
                            sap.m.MessageBox.error(JSON.stringify(oError));
                        }
                    });
                });
            },
            PrintDocumentService: function (result) {
                var that = this;
                var oView = this.getView();
                var oDataModel = oView.getModel();
                var aRequestID = result.map(function (item) {
                    return {
                        RequestNo: item.RequestNo
                    };
                });
                that.aResponsePayload = [];
                aRequestID.forEach((reqID) => {
                    that.aResponsePayload.push(that.callPrintDocumentService(reqID))
                })
                result.forEach((item) => {
                    var sContent = that.callPrintDocumentService({
                        RequestNo: item.RequestNo
                    })
                    sContent.then(function (oVal) {
                        item.Content = oVal.Bytes;
                        debugger;
                        if (item.Type === 'PACKING_LIST' && item.SubType === 'MATERIAL')
                            that.getViewModel("DocumentModel").getProperty("/PL_Material").push(item);
                        else if (item.Type === 'PACKING_LIST' && item.SubType === 'INVOICE')
                            that.getViewModel("DocumentModel").getProperty("/PL_Invoice").push(item);
                        else if (item.Type === 'PACKING_LIST' && item.SubType === 'OTHERS')
                            that.getViewModel("DocumentModel").getProperty("/PL_Others").push(item);

                        that.getViewModel("DocumentModel").refresh();
                    });
                });
            },
            callPrintDocumentService: function (reqID) {
                var promise = jQuery.Deferred();
                var othat = this;
                var oView = this.getView();
                var oDataModel = oView.getModel();
                //console.log(oPayLoad);
                // reqID.RequestNo = 'REQ00001'                  // For testing only, Comment for production
                return new Promise((resolve, reject) => {
                    oDataModel.create("/PrintDocumentEdmSet", reqID, {
                        success: function (data) {
                            // debugger;
                            resolve(data);
                        },
                        error: function (data) {
                            reject(data);
                        },
                    });
                });
            },

            onClose: function (oEvent) {
                this.oRouter.navTo("RouteLandingPage");
                // window.history.go(-1);
            },

            onChangeVehicleNumberPress: function () {
                var bWantChange = this.getViewModel("oViewHandlingModel").getProperty("/wantChange");
                if (bWantChange) {
                    this.getViewModel("oViewHandlingModel").setProperty("/wantChange", false);
                } else {
                    this.getViewModel("oViewHandlingModel").setProperty("/wantChange", true)
                }
            },

            // On Approve Press Vehicle Number
            onPressApproveQRCode: function () {
                this.byId("idHboxReEnterVehicleNob").setVisible(false);
            },

            // On Reject Press Vehicle Number
            onPressRejectQRCode: function () {
                this.byId("idHboxReEnterVehicleNob").setVisible(true);
            },

            // On Submit Press - 
            onPressSubmitQRCode: function (oEvent) {
                //initialize the action
                // if (this.getViewModel("oViewHandlingModel").getProperty("/EnterVehicleNo") === this.getViewModel("oViewHandlingModel").getProperty("/ReEnterVehicleNo")) {
                var that = this,
                    oViewContext = this.getView().getBindingContext().getObject(),
                    oBindingObject = oEvent.getSource().getObjectBinding();

                //set the parameters
                oBindingObject.getParameterContext().setProperty("packingListId", oViewContext.packing_list.ID);
                oBindingObject.getParameterContext().setProperty("vehicleNumber", this.getViewModel("oViewHandlingModel").getProperty("/ReEnterVehicleNo"));

                //execute the action
                oBindingObject.execute().then(
                    function () {
                        sap.m.MessageToast.show("Submited Successfully");
                        that.getView().getModel().refresh();
                        that.getViewModel("oViewHandlingModel").setProperty("/wantChange", false);
                    },
                    function (oError) {
                        sap.m.MessageBox.alert(oError.message, {
                            title: "Error"
                        });
                    }
                );
                // } else {
                //    sap.m.MessageBox.alert("Vehicle Numbers do not match!");
                //}
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
            //             name: "com.agel.mmts.securityscanhistory.view.fragments.packingListDetails.QRCodeViewer",
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

            // onViewQRCodePress1: function (oEvent) {
            //     var sParentItemPath = oEvent.getSource().getBindingContext().getPath();
            //     var sDialogTitleObject = oEvent.getSource().getParent().getBindingContext().getObject();
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
            //             name: "com.agel.mmts.securityscanhistory.view.fragments.packingListDetails.QRCodeViewer1",
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

                try {
                    var sParentItemPath = oEvent.getParameter("oSource").getBindingContext().getPath();
                }
                catch (e) {
                    sParentItemPath = oEvent.getSource().getBindingContext().getPath();
                }
                var qrcodeID = this.getViewModel().getProperty(sParentItemPath).QRNumber;
                var aPayload = {
                    "QRNumber": qrcodeID
                };
                this.getComponentModel().create("/QuickAccessQRCodeEdmSet", aPayload, {
                    success: function (oData, oResponse) {
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
                        sap.m.MessageBox.success(JSON.stringify(oError));
                    }
                })
            },

            onViewQRCodePress1: function (oEvent) {
                try {
                    var sParentItemPath = oEvent.getParameter("oSource").getBindingContext().getPath();
                }
                catch (e) {
                    sParentItemPath = oEvent.getSource().getBindingContext().getPath();
                }
                var qrcodeID = this.getViewModel().getProperty(sParentItemPath).QRNumber;
                var aPayload = {
                    "QRNumber": qrcodeID
                };
                this.getComponentModel().create("/QuickAccessQRCodeEdmSet", aPayload, {
                    success: function (oData, oResponse) {
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
                        sap.m.MessageBox.success(JSON.stringify(oError));
                    }
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
    });
