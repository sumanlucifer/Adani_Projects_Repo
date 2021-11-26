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
    'sap/base/util/deepExtend',
    'sap/ui/export/Spreadsheet',
    'sap/m/MessageToast',
    "sap/m/MessageBox",
    "sap/m/ObjectIdentifier",
    "sap/m/Text",
    "sap/m/Button",
    "../utils/formatter",
    "jquery.sap.global",
    "sap/m/PDFViewer"
],
	/**
	 * @param {typeof sap.ui.core.mvc.Controller} Controller
	 */
    function (BaseController, JSONModel, Filter, FilterOperator, Fragment, Sorter, Device, History, ColumnListItem, Input, deepExtend, Spreadsheet, MessageToast, MessageBox, ObjectIdentifier, Text, Button, formatter, jquery, PDFViewer) {
        "use strict";

        return BaseController.extend("com.agel.mmts.storeinchargeapprovals.controller.ApprovalsDetail", {
            formatter: formatter,

            onInit: function () {
                jquery.sap.addUrlWhitelist("blob");
                this.getView().addEventDelegate({
                    onAfterShow: this.onBeforeShow,
                }, this);
                //view model instatiation
                var oViewModel = new JSONModel({
                    busy: false,
                    delay: 0,
                    viewQrCode: false
                });
                this.setModel(oViewModel, "objectViewModel");

                this._createBOQApprovalModel();

                //Router Object
                this.oRouter = this.getRouter();
                this.oRouter.getRoute("RouteApprovalsDetail").attachPatternMatched(this._onObjectMatched, this);
            },

            _onObjectMatched: function (oEvent) {
                var sObjectId = oEvent.getParameter("arguments").PLNo;
                this._bindView("/PrintAssistanceSet(" + sObjectId + ")");
            },

            _bindView: function (sObjectPath) {
                var objectViewModel = this.getViewModel("objectViewModel");
                var that = this;
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
                this.getViewModel("objectViewModel").setProperty(
                    "/busy",
                    true
                );
                var promise = jQuery.Deferred();
                var that = this;
                var oView = this.getView();
                var oDataModel = oView.getModel();
                //console.log(oPayLoad);
                return new Promise((resolve, reject) => {
                    this.getOwnerComponent().getModel().read("/PackingListSet(" + this.packingListId + ")/Attachments", {
                        success: function (oData, oResponse) {
                            this.getViewModel("objectViewModel").setProperty(
                                "/busy",
                                false
                            );
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
                            this.getViewModel("objectViewModel").setProperty(
                                "/busy",
                                false
                            );
                            //sap.m.MessageBox.error(JSON.stringify(oError));
                        }.bind(this),
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

            onChildTableUpdateStarted: function (oEvent) {
                oEvent.getSource().setBusy(true);
            },

            onChildItemsTableUpdateFinished: function (oEvent) {
                oEvent.getSource().setBusy(false);
            },

            onClose: function (oEvent) {
                this.oRouter.navTo("RouteLandingPage");
            },


            // QR Code View 

            // onViewQRCodePress: function (oEvent) {
            //     var sParentItemPath = oEvent.getSource().getBindingContext().getPath();
            //     var sDialogTitleObject = oEvent.getSource()._getBindingContext().getProperty();
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
            //             name: "com.agel.mmts.storeinchargeapprovals.view.fragments.QRCodeViewer",
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

            // QR Code View Smart

            // onViewQRCodePressSmart: function (oEvent) {
            //     var sParentItemPath = oEvent.getParameter("oSource").getBindingContext().getPath();
            //     var sDialogTitleObject = oEvent.getSource()._getBindingContext().getProperty();
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
            //             name: "com.agel.mmts.storeinchargeapprovals.view.fragments.QRCodeViewer",
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

                try {
                    var sParentItemPath = oEvent.getParameter("oSource").getBindingContext().getPath();
                }
                catch (e) {
                    sParentItemPath = oEvent.getSource().getBindingContext().getPath();
                }
                var qrcodeID = this.getViewModel().getProperty(sParentItemPath).QRNumber;
                var aPayload = {
                    "QRNumber": qrcodeID,
                    "RegeneratedQRId" : 0
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

            onViewQRCodePressSmart: function (oEvent) {
                this.getViewModel("objectViewModel").setProperty(
                    "/busy",
                    true
                );
                try {
                    var sParentItemPath = oEvent.getParameter("oSource").getBindingContext().getPath();
                }
                catch (e) {
                    sParentItemPath = oEvent.getSource().getBindingContext().getPath();
                }
                var qrcodeID = this.getViewModel().getProperty(sParentItemPath).QRNumber;
                var aPayload = {
                    "QRNumber": qrcodeID,
                    "RegeneratedQRId" : 0
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
            },


            _createBOQApprovalModel: function () {

                var oModel = new JSONModel({
                    BOQApprovedRequestId: null,
                    Status: null,
                    Comment: null,
                    BOQGroupId: null,
                    isPostButtonEnabled: false,
                    Label: null
                });

                this.setModel(oModel, "BOQApprovalModel");
            },

            onApprovePress: function (oEvent) {
                this.getViewModel("objectViewModel").setProperty(
                    "/busy",
                    true
                );
                // debugger;
                var that = this;
                if (this.getView().getBindingContext().getObject().ID.length) {
                    var PackingListId = this.byId("vBoxid").getBindingContext().getObject().ID;
                    var userName = "Agel_July";


                    // var userName = sap.ushell.Container.getService("UserInfo").getFullName();


                    var oPayload = {
                        "PackingListId": PackingListId,
                        "UserName": userName,
                        "RequestApproved": true,
                        "PrintAssistanceId": this.getView().getBindingContext().getObject().ID
                    };

                    this.getOwnerComponent().getModel().create("/StoreInchargeQRCodePrintingAssistanceSet", oPayload, {
                        success: function (oData, oResponse) {
                            this.getViewModel("objectViewModel").setProperty(
                                "/busy",
                                false
                            );
                            sap.m.MessageBox.success("The pending request is approved");
                            this.getOwnerComponent().getModel().refresh();
                        }.bind(this),
                        error: function (oError) {
                            this.getViewModel("objectViewModel").setProperty(
                                "/busy",
                                false
                            );
                            //sap.m.MessageBox.error(JSON.stringify(oError));
                        }.bind(this),
                    });
                } else {
                    sap.m.MessageBox.error("Oops! Error occured please try again in sometime.");
                }
            },

            onRejectPress: function (oEvent) {
                // debugger;
                var that = this;
                this.getViewModel("objectViewModel").setProperty(
                    "/busy",
                    true
                );
                if (this.getView().getBindingContext().getObject().ID.length) {
                    var PackingListId = this.byId("vBoxid").getBindingContext().getObject().ID;
                    var userName = "Agel_July";
                    // var userName = sap.ushell.Container.getService("UserInfo").getFullName();


                    var oPayload = {
                        "PackingListId": PackingListId,
                        "UserName": userName,
                        "RequestApproved": false,
                        "PrintAssistanceId": this.getView().getBindingContext().getObject().ID
                    };

                    this.getOwnerComponent().getModel().create("/StoreInchargeQRCodePrintingAssistanceSet", oPayload, {
                        success: function (oData, oResponse) {
                            this.getViewModel("objectViewModel").setProperty(
                                "/busy",
                                false
                            );
                            sap.m.MessageBox.success("The pending request is rejected");
                            this.getOwnerComponent().getModel().refresh();
                        }.bind(this),
                        error: function (oError) {
                            this.getViewModel("objectViewModel").setProperty(
                                "/busy",
                                false
                            );
                            //sap.m.MessageBox.error(JSON.stringify(oError));
                        }.bind(this),
                    });
                } else {
                    sap.m.MessageBox.error("Oops! Error occured please try again in sometime.");
                }
            },

            onViewQRCodePackingList: function (oEvent) {
                // debugger;
                if (oEvent.getParameter("state"))
                    this.getView().getModel("objectViewModel").setProperty("/viewQrCode", true);

                else
                    this.getView().getModel("objectViewModel").setProperty("/viewQrCode", false);

            }


        });
    });
