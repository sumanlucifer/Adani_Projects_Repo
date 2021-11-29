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
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "../utils/formatter",
    "sap/m/PDFViewer"
],
	/**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (BaseController, JSONModel, Filter, FilterOperator, Fragment, Sorter, Device, History, ColumnListItem, Input, jquery, MessageBox, MessageToast, formatter, PDFViewer) {
        "use strict";
        return BaseController.extend("com.agel.mmts.storeinchargeraisedpo.controller.PackingListDetails", {
            formatter: formatter,

            onInit: function () {
                jquery.sap.addUrlWhitelist("blob");
                //view model instatiation
                var oViewModel = new JSONModel({
                    busy: true,
                    delay: 0
                });
                this.setModel(oViewModel, "objectViewModel");

                var oViewHandlingModel = new JSONModel({
                    "closeButton": false,
                    "submitButton": true
                });
                this.setModel(oViewHandlingModel, "oViewHandlingModel");

                this.MainModel = this.getComponentModel();
                this.getView().setModel(this.MainModel);

                //Router Object
                this.oRouter = this.getRouter();
                this.oRouter.getRoute("RouteDetailsPage").attachPatternMatched(this._onObjectMatched, this);

            },

            // On Object Matched 
            _onObjectMatched: function (oEvent) {
                this.RequestId = oEvent.getParameter("arguments").RequestId;
                this._bindView("/PackingListSet" + this.RequestId);
                // this.fnGetMasterMaterialValArea();
            },

            // View Level Binding
            _bindView: function (sObjectPath) {
                var that = this;
                var objectViewModel = this.getViewModel("objectViewModel");

                this.getView().bindElement({
                    path: sObjectPath,
                    parameter: { expand: 'GRNS' },
                    events: {
                        dataRequested: function () {
                            objectViewModel.setProperty("/busy", true);
                        },
                        dataReceived: function () {
                            objectViewModel.setProperty("/busy", false);
                            // that.readGRNS(sObjectPath + "/GRNS");
                            var documentResult = that.getDocumentData();
                            documentResult.then(function (result) {
                                that.PrintDocumentService(result);
                            });
                        }
                    }
                });
            },

            fnGetMasterMaterialValArea: function () {
                this.getOwnerComponent().getModel().read("/MasterMaterialValAreaSet", {
                    success: function (oResponse) {
                        var oMasterMaterialValAreaModel = new JSONModel(oResponse.results);
                        this.getView().setModel(oMasterMaterialValAreaModel, "MasterMaterialValAreaModel");
                    }.bind(this),
                    error: function (oError) {
                        this.messages.showErrorMessage(oError);
                        this.getView().setBusy(false);
                    }.bind(this)
                });

            },

            getDocumentData: function () {
                var promise = jQuery.Deferred();
                var that = this;
                var oView = this.getView();
                var oDataModel = oView.getModel();
                //console.log(oPayLoad);
                return new Promise((resolve, reject) => {
                    // this.getOwnerComponent().getModel().read("/PackingListSet(" + this.packingListId + ")/Attachments", {
                    this.getOwnerComponent().getModel().read("/PackingListSet" + this.RequestId + "/Attachments", {
                        success: function (oData) {
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

            readGRNS: function (sPath) {
                this.MainModel.read(sPath, {
                    success: function (oData, oResponse) {
                        // debugger;
                        var filtered = oData.results.filter((item) => item.Status === "APPROVED");
                        if (filtered.length > 0)
                            this.byId("idrequestGRNButton").setVisible(false);
                        else
                            this.byId("idrequestGRNButton").setVisible(true);
                    }.bind(this),
                    error: function (oError) {
                        sap.m.MessageBox.error(JSON.stringify(oError));
                    }
                });
            },

            onClose: function (oEvent) {
                this.oRouter.navTo("RouteLandingPage");
            },


            // // QR Code View 
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
            //             name: "com.agel.mmts.storeinchargeraisedpo.view.fragments.QRCodeViewer",
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

            // // QR Code View 
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
            //             name: "com.agel.mmts.storeinchargeraisedpo.view.fragments.QRCodeViewer",
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
                    "QRNumber": qrcodeID,
                    "RegeneratedQRId": 0
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

            onViewQRCodePressSmart: function (oEvent) {
                try {
                    var sParentItemPath = oEvent.getParameter("oSource").getBindingContext().getPath();
                }
                catch (e) {
                    sParentItemPath = oEvent.getSource().getBindingContext().getPath();
                }
                var qrcodeID = this.getViewModel().getProperty(sParentItemPath).QRNumber;
                var aPayload = {
                    "QRNumber": qrcodeID,
                    "RegeneratedQRId": 0
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

            onUDDetailsPress: function (oEvent) {
                //  debugger;
                var sParentItemPath = oEvent.getSource().getParent().getBindingContextPath();
                var sDialogTitle = "GRN - " + oEvent.getSource().getBindingContext().getObject().ID;
                var oDetails = {};
                oDetails.controller = this;
                oDetails.view = this.getView();
                oDetails.sParentItemPath = sParentItemPath;
                oDetails.title = sDialogTitle;
                if (!this.pDialog) {
                    this.pDialog = Fragment.load({
                        id: oDetails.view.getId(),
                        name: "com.agel.mmts.storeinchargeraisedpo.view.fragments.common.ViewUDDetailsDialog",
                        controller: oDetails.controller
                    }).then(function (oDialog) {
                        // connect dialog to the root view of this component (models, lifecycle)
                        oDetails.view.addDependent(oDialog);
                        if (Device.system.desktop) {
                            oDialog.addStyleClass("sapUiSizeCompact");
                        }
                        oDialog.bindElement({
                            path: oDetails.sParentItemPath,
                            parameters: {
                                "expand": 'UDDetail'
                            }
                        });
                        oDialog.setTitle(oDetails.title);
                        return oDialog;
                    });
                }
                this.pDialog.then(function (oDialog) {
                    oDetails.view.addDependent(oDialog);
                    oDialog.bindElement({
                        path: oDetails.sParentItemPath,
                        parameters: {
                            'expand': 'UDDetail'
                        }
                    });
                    oDialog.setTitle(oDetails.title);
                    oDialog.open();
                });
            },

            onViewUDDetailsDialogClose: function (oEvent) {
                this.pDialog.then(function (oDialog) {
                    oDialog.close();
                });
            },

            onCancelGRNPress: function (oEvent) {
                var that = this;
                var gID = oEvent.getSource().getBindingContext().getObject().ID;
                var oPayload = {
                    "GRNId": gID,
                    "UserName": "Agel_Sep"

                };
                MessageBox.confirm("Do you really want to cancel GRN ?", {
                    icon: MessageBox.Icon.INFORMATION,
                    title: "Confirm",
                    actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                    emphasizedAction: MessageBox.Action.YES,
                    onClose: function (oAction) {
                        if (oAction == "YES") {
                            that.getOwnerComponent().getModel().create("/CancelGRNEdmSet", oPayload, {
                                success: function (oData, oResponse) {
                                    if (oData.Success) {
                                        sap.m.MessageBox.success("This GRN is cancelled");
                                        that.getOwnerComponent().getModel().refresh();
                                    }
                                    else
                                        sap.m.MessageBox.error(oData.Message);
                                }.bind(this),
                                error: function (oError) {
                                    sap.m.MessageBox.error(JSON.stringify(oError));
                                }
                            });
                        }
                    }
                });
            },

            handleSelectionChange: function (oEvent) {
                var aGRNItems = this.getView().getModel("requestModel").getProperty("/GRNItems"),
                    oGRMItem = {
                        RestrictedStoreStockParentId: oEvent.getSource().getSelectedItem().getBindingContext().getObject().ID,
                        ValuationType: oEvent.getSource().getSelectedItem().getProperty("text")
                    },
                    iIndex = aGRNItems.findIndex(function (oItem) {
                        return oItem.RestrictedStoreStockParentId === oGRMItem.RestrictedStoreStockParentId;
                    });

                if (iIndex >= 0) {
                    aGRNItems.splice(iIndex, 1, oGRMItem);
                } else {
                    aGRNItems.push(oGRMItem);
                }

                this.getView().getModel("requestModel").setProperty("/GRNItems", aGRNItems);

            },

            onLoadValuationAreaItems: function (oEvent) {
                var sMaterialCode = oEvent.getSource().getParent().getBindingContext().getObject().MaterialCode;
                var oMaterialCodeFilter = new sap.ui.model.Filter("MaterialCode", sap.ui.model.FilterOperator.Contains, sMaterialCode);
                oEvent.getSource().getBinding("items").filter(oMaterialCodeFilter);
            },

            onRequestGRNPress: function (oEvent) {
                var sParentItemPath = this.getView().getBindingContext().sPath;
                var requestModel = new JSONModel({
                    MovementType: "101 - GRN",
                    quantity: null,
                    delivery: null,
                    billoflading: null,
                    // gatepassnumber: null,
                    valueState: null,
                    reference: null,
                    isConfirmButtonEnabled: false,
                    valueStateText: "",
                    GRNItems: []
                });
                this.getView().setModel(requestModel, "requestModel");

                // if (!this._oRequestDialog) {
                this._oRequestDialog = sap.ui.xmlfragment("com.agel.mmts.storeinchargeraisedpo.view.fragments.common.ViewRequestGRNDialog", this);
                var oDialog = this._oRequestDialog;
                this.getView().addDependent(oDialog);
                if (Device.system.desktop) {
                    oDialog.addStyleClass("sapUiSizeCompact");
                }
                oDialog.bindElement({
                    path: sParentItemPath,
                    parameters: {
                        "expand": 'RestrictedStoreStockParents, PurchaseOrder, PackingListParentItems'
                    }
                });
                oDialog.setTitle("Request GRN");
                // return oDialog;
                // }
                this._oRequestDialog.open();
            },

            // onDeliveryNoteLiveChange: function (oEvent) {
            //     var oPOData = this.getView().getBindingContext().getObject();
            //     if (oEvent.getSource().getValue().length)
            //         this.getViewModel("requestModel").setProperty("/isConfirmButtonEnabled", true);
            //     else
            //         this.getViewModel("requestModel").setProperty("/isConfirmButtonEnabled", false);
            // },

            onQuantityLiveChange: function (oEvent) {
                var oGRNData = this.getView().getBindingContext().getObject();
                if (oEvent.getSource().getValue().length && parseFloat(oEvent.getSource().getValue()) > 0) {
                    // this.getViewModel("requestModel").setProperty("/isConfirmButtonEnabled", true);
                    oEvent.getSource().setValueState("None");
                    oEvent.getSource().setValueStateText("");
                }
                else {
                    // this.getViewModel("requestModel").setProperty("/isConfirmButtonEnabled", false);
                    oEvent.getSource().setValueState("Error");
                    oEvent.getSource().setValueStateText("Weight should be more than 0.");
                }

                if (parseFloat(oEvent.getSource().getValue()) > parseFloat(oGRNData.TotalWeight) || parseFloat(oEvent.getSource().getValue()) <= 0) {
                    // sap.m.MessageBox.error("Total Packaging Weight should more than 0 and not exceed Total Vendor Entered Weight.");
                    // this.getViewModel("requestModel").setProperty("/isConfirmButtonEnabled", false);
                    oEvent.getSource().setValueState("Error");
                    oEvent.getSource().setValueStateText("Weight should be less than total weight.");
                }
                else {
                    // this.getViewModel("requestModel").setProperty("/isConfirmButtonEnabled", true);
                    oEvent.getSource().setValueState("None");
                    oEvent.getSource().setValueStateText("");
                }
                this.fnSetRequestButtonEnableDisable();
            },

            onViewChildDialogClose: function (oEvent) {
                this._oRequestDialog.close();
            },

            fnSetRequestButtonEnableDisable: function () {
                var sDelivery = this.getViewModel("requestModel").getProperty("/delivery"),
                    sQuantity = this.getViewModel("requestModel").getProperty("/quantity"),
                    sBillofLading = this.getViewModel("requestModel").getProperty("/billoflading"),
                    sReference = this.getViewModel("requestModel").getProperty("/reference"),
                    sLRNumber = this.getViewModel("requestModel").getProperty("/lrnumber");

                if (sDelivery !== "" && sQuantity !== "" && sBillofLading !== "" && sReference !== "" && sLRNumber !== "")
                    this.getViewModel("requestModel").setProperty("/isConfirmButtonEnabled", true);
                else
                    this.getViewModel("requestModel").setProperty("/isConfirmButtonEnabled", false);
            },

            onRequestPress: function (oEvent) {
                var sDelivery = this.getViewModel("requestModel").getProperty("/delivery");
                var sQuantity = this.getViewModel("requestModel").getProperty("/quantity");
                var sBillofLading = this.getViewModel("requestModel").getProperty("/billoflading");
                var sReference = this.getViewModel("requestModel").getProperty("/reference");
                // var sGatePassNumber = this.getViewModel("requestModel").getProperty("/gatepassnumber");
                var sLRNumber = this.getViewModel("requestModel").getProperty("/lrnumber");
                //var sGRNTblData=sap.ui.getCore().byId("idGRNItemsTBL").getBindingContext().getModel().getProperty("/RestrictedStoreStockParentSet(17l)").ID
                var aGRNItems = this.getView().getModel("requestModel").getProperty("/GRNItems");
                if (aGRNItems.length === 0) {
                    sap.m.MessageToast.show("Please provide items to request GRN.");
                    return;
                }
                else {
                    var oModel = this.getComponentModel();
                    if (parseInt(sQuantity) > 0) {
                        if (sDelivery !== null) {
                            var oPayload = {
                                "TotalPackagingWeight": parseInt(sQuantity),
                                "DeliveryNote": sDelivery,
                                "BillOfLading": sBillofLading,
                                // "GatePassNumber": sGatePassNumber,
                                "LRNumber": sLRNumber,
                                "Reference": sReference,
                                "PackingListId": this.getView().getBindingContext().getObject().ID,
                                "UserName": "Agel_Sep",
                                "GRNItems": aGRNItems
                            };
                        } else {
                            var oSelectedItemData = this.byId("idGRNTable").getSelectedItem().getBindingContext().getObject();

                            var oPayload = {
                                "TotalPackagingWeight": parseInt(sQuantity),
                                "DeliveryNote": sDelivery,
                                "BillOfLading": sBillofLading,
                                // "GatePassNumber": sGatePassNumber,
                                "LRNumber": sLRNumber,
                                "Reference": sReference,
                                "PackingListId": parseInt(oSelectedItemData.ID),
                                "UserName": "Agel_Sep",
                                "GRNItems": aGRNItems
                            };
                        }

                        if (oPayload) {
                            oModel.create("/GRNEdmSet", oPayload, {
                                success: function (oData) {
                                    if (oData.Success) {
                                        sap.m.MessageBox.success(oData.Message);
                                        this.getComponentModel().refresh();
                                    }
                                    else
                                        sap.m.MessageBox.error(oData.Message);
                                }.bind(this),
                                error: function (oError) {
                                    sap.m.MessageBox.error(JSON.stringify(oError));
                                }
                            });
                        }
                    } else {
                        sap.m.MessageBox.error("Please enter positive and a non zero number for Quantity")
                    }
                    this._oRequestDialog.close();
                }
            },
        });
    });
