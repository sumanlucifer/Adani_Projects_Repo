sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/Fragment",
    // "sap/ui/model/Sorter",
    "sap/ui/Device",
    // "sap/ui/core/routing/History",
    // 'sap/m/ColumnListItem',
    'sap/m/Input',
    "jquery.sap.global",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/m/PDFViewer",
    "../utils/formatter",
],
	/**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (BaseController, JSONModel, Filter, FilterOperator, Fragment, Device, Input, jquery, MessageBox, MessageToast, PDFViewer, formatter) {
        "use strict";
        return BaseController.extend("com.agel.mmts.unloadmaterial.controller.PackingListDetails", {
            formatter: formatter,

            onInit: function () {
                jquery.sap.addUrlWhitelist("blob");

                //get logged in User
                try {
                    this.UserEmail = sap.ushell.Container.getService("UserInfo").getEmail();
                    this.UserFName = sap.ushell.Container.getService("UserInfo").getFullName();
                }
                catch (e) {
                    this.UserEmail = 'test.user@extentia.com';
                    this.UserFName = 'Test User';
                }

                //view model instatiation
                var oViewModel = new JSONModel({
                    busy: true,
                    delay: 0
                });
                this.setModel(oViewModel, "objectViewModel");

                var oViewHandlingModel = new JSONModel({
                    "closeButton": false,
                    "submitButton": true,
                    "unloadQrCode": null,
                    "unloadQrType": null,
                    "unloadingComplete": false,
                    "unloadingMismatch": false
                });
                this.setModel(oViewHandlingModel, "oViewHandlingModel");

                this.MainModel = this.getComponentModel();
                this.getView().setModel(this.MainModel);

                //Router Object
                this.oRouter = this.getRouter();
                this.oRouter.getRoute("RouteUnloadMaterial").attachPatternMatched(this._onObjectMatched, this);

            },

            // On Object Matched 
            _onObjectMatched: function (oEvent) {
                this.RequestId = oEvent.getParameter("arguments").RequestId;
                this._bindView("/PackingListSet(" + this.RequestId + ")");

                //copy data to JSON Model
                var sBindingPath = "/PackingListSet(" + this.RequestId + ")";
                var oModel = this.getView().getModel();
                var oView = this.getView();
                var oJSONData =
                {
                    "PackingListId": null,
                    "GateEntryDate": null,
                    "UnloadPoint": null,
                    "OuterPackings": [
                    ],
                    "InnerPackings": [
                    ]
                }
                oModel.read(sBindingPath, {
                    urlParameters: {
                        "$expand": "OuterPackagings,InnerPackagings,PackingListParentItems",
                        "$select": "ID,OuterPackagings,InnerPackagings,PackingListParentItems,CreatedAt,CreatedBy,GateEntryDate"
                    },
                    success: function (oRetrievedResult) {
                        if (oRetrievedResult) {
                            oJSONData.PackingListId = oRetrievedResult.ID;
                            // oJSONData.CreatedBy = oRetrievedResult.CreatedBy;
                            // oJSONData.CreatedAt = oRetrievedResult.CreatedAt;
                            // oJSONData.UpdatedAt = "/Date(" + new Date().getTime() + ")/";
                            oJSONData.UpdatedAt = new Date();
                            oJSONData.CreatedAt = new Date();
                            oJSONData.GateEntryDate = oRetrievedResult.GateEntryDate;
                        }
                            oJSONData.UpdatedBy = this.UserFName;
                            oJSONData.CreatedBy = this.UserFName;
                        try {
                            var sParentListItemid = oRetrievedResult.PackingListParentItems.results[0].ID;
                        }
                        catch (e) {
                            sParentListItemid = null;
                        }
                        oRetrievedResult.InnerPackagings.results.forEach((oInner) => {
                            if (!oInner.OuterPackagingId)
                                oInner.OuterPackagingId = -1;
                            var ofinalInner = {
                                "OuterPackagingId": oInner.OuterPackagingId,
                                "InnerPackagingId": oInner.ID,
                                "LineItemId": 1,
                                "PackagingQty": oInner.PackagingQty,
                                "ReceivedQty": null,
                                "QRNumber": null,
                                "UOM": oInner.UOM,
                                "ExternalQRCode": "",
                                "PackingListParentItemId": sParentListItemid,
                                "InnerPackingLabel": oInner.PackagingType,
                                "LineItemLabel": oInner.Name
                            }
                            oJSONData.InnerPackings.push(ofinalInner);
                        })

                        oRetrievedResult.OuterPackagings.results.forEach((oOuter) => {
                            var ofinalOuter = {
                                "OuterPackagingId": oOuter.ID,
                                "InnerPackagingCount": oOuter.InnerPackagingsCount,
                                "ReceivedInnerCount": null,
                                "QRNumber": null,
                                "OuterPackagingLabel": oOuter.PackagingType
                            }
                            oJSONData.OuterPackings.push(ofinalOuter);
                        })
                        oView.setModel(new JSONModel(oJSONData), "JSONModelData");
                    }.bind(this),
                    error: function (oError) { }
                });

                // this.getView().setModel(oJSONData,"JSONModelData");
            },

            // View Level Binding
            _bindView: function (sObjectPath) {
                var that = this;
                var objectViewModel = this.getViewModel("objectViewModel");

                this.getView().bindElement({
                    path: sObjectPath,
                    events: {
                        change: this._onBindingChange.bind(this),
                        dataRequested: function () {
                            objectViewModel.setProperty("/busy", true);
                        },
                        dataReceived: function () {
                            objectViewModel.setProperty("/busy", false);
                        }
                    }
                });
            },

            _onBindingChange: function () {
                var oView = this.getView(),
                    oViewModel = this.getViewModel("objectViewModel"),
                    oElementBinding = oView.getElementBinding();
                // No data for the binding
                if (!oElementBinding.getBoundContext()) {
                    this.getRouter().getTargets().display("notFound");
                    return;
                }
            },

            onClose: function (oEvent) {
                this.oRouter.navTo("RouteLandingPage");
            },

            // QR Code Scan 
            onScanQRCodePress: function (oEvent) {
                var sParentItemPath = oEvent.getSource()._getBindingContext().getPath();
                var sDialogTitleObject = oEvent.getSource()._getBindingContext().getProperty();
                var oDetails = {};
                oDetails.controller = this;
                oDetails.view = this.getView();
                oDetails.sParentItemPath = sParentItemPath;
                oDetails.title = "QR Code";
                if (!this.scanqrDialog) {
                    this.scanqrDialog = Fragment.load({
                        id: oDetails.view.getId(),
                        name: "com.agel.mmts.unloadmaterial.view.fragments.unloadMaterial.scanqr",
                        controller: oDetails.controller
                    }).then(function (oDialog) {
                        // connect dialog to the root view of this component (models, lifecycle)
                        oDetails.view.addDependent(oDialog);
                        oDialog.bindElement({
                            path: oDetails.sParentItemPath,
                        });
                        if (Device.system.desktop) {
                            oDialog.addStyleClass("sapUiSizeCompact");
                        }
                        oDialog.setTitle(oDetails.title);
                        return oDialog;
                    });
                }
                this.scanqrDialog.then(function (oDialog) {
                    oDetails.view.addDependent(oDialog);
                    oDialog.bindElement({
                        path: oDetails.sParentItemPath,
                    });
                    oDialog.setTitle(oDetails.title);
                    oDialog.open();
                    //Change scan button icon
                    var oScanButton = sap.ui.getCore().byId(oDetails.view.getId()+"--"+"idQRSubmit");
                    oScanButton.getAggregation("_btn").setIcon("sap-icon://qr-code");
                });
            },

            onQRCodeScanDialogClosePress: function (oEvent) {
                this.scanqrDialog.then(function (oDialog) {
                    oDialog.close();
                });
            },

            onQrNotFoundPress: function (oEvent) {
                var oDetails = {};
                oDetails.controller = this;
                oDetails.view = this.getView();
                oDetails.title = "Access Vendor created QR Code";
                if (!this.qrNotFoundDialog) {
                    this.qrNotFoundDialog = Fragment.load({
                        id: oDetails.view.getId(),
                        name: "com.agel.mmts.unloadmaterial.view.fragments.unloadMaterial.qrNotFound",
                        controller: oDetails.controller
                    }).then(function (oDialog) {
                        // connect dialog to the root view of this component (models, lifecycle)
                        oDetails.view.addDependent(oDialog);
                        if (Device.system.desktop) {
                            oDialog.addStyleClass("sapUiSizeCompact");
                        }
                        oDialog.setTitle(oDetails.title);
                        return oDialog;
                    });
                }
                this.qrNotFoundDialog.then(function (oDialog) {
                    oDialog.open();
                });
            },

            onViewVendorQRPress: function (oEvent) {
                this.qrNotFoundDialog.then(function (oDialog) {
                    oDialog.close();
                });
                this.onPackingListContainsPress();
            },

            onViewVendorQRCancelPress: function (oEvent) {
                this.qrNotFoundDialog.then(function (oDialog) {
                    oDialog.close();
                });
            },

            onPackingListContainsPress: function () {
                var oDetails = {};
                oDetails.controller = this;
                oDetails.view = this.getView();
                oDetails.title = "Packing List Contains";
                if (!this.packingListContainsDialog) {
                    this.packingListContainsDialog = Fragment.load({
                        id: oDetails.view.getId(),
                        name: "com.agel.mmts.unloadmaterial.view.fragments.unloadMaterial.packingListContains",
                        controller: oDetails.controller
                    }).then(function (oDialog) {
                        // connect dialog to the root view of this component (models, lifecycle)
                        oDetails.view.addDependent(oDialog);
                        if (Device.system.desktop) {
                            oDialog.addStyleClass("sapUiSizeCompact");
                        }
                        oDialog.setTitle(oDetails.title);
                        return oDialog;
                    });
                }
                this.packingListContainsDialog.then(function (oDialog) {
                    oDialog.open();
                });
            },

            onPackingListContainsClosePress: function (oEvent) {
                this.packingListContainsDialog.then(function (oDialog) {
                    oDialog.close();
                });
            },

            handleToUnloadMaterialBreadcrumPress: function () {
                this.getRouter().navTo("RouteNewConsignment");
            },

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
                            MessageBox.error("QR Code is wrong");
                        }
                        this.getComponentModel().refresh();
                    }.bind(this),
                    error: function (oError) {
                        // MessageBox.success(JSON.stringify(oError));
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
                _pdfViewer.setShowDownloadButton(true);
                _pdfViewer.open();
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
                            this.getViewModel("oViewHandlingModel").setProperty("/unloadQrCode", JSON.parse(JSON.parse(sScannedValue)).QRNumber);
                            this.onPressSubmitQRCode();
                        } else {
                            this.getViewModel("oViewHandlingModel").setProperty("/unloadQrCode", "");
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

            onQRCodeSuggestionSelected: function (oEvent) {
                var sScanQrcodeno = oEvent.getSource().getSelectedKey();
                if (sScanQrcodeno)
                    this.getViewModel("oViewHandlingModel").setProperty("/unloadQrCode", sScanQrcodeno);
            },

            onPressSubmitQRCode: function () {
                var oModel = this.getViewModel();
                var oViewHandlingModel = this.getViewModel("oViewHandlingModel");
                var sUnloadQR = oViewHandlingModel.getProperty("/unloadQrCode");
                var oDetails = [];
                oDetails.controller = this;
                oDetails.view = this.getView();
                oDetails.title = "QR Code Packaging - ";
                var aFilter = new Filter("QRNumber", sap.ui.model.FilterOperator.EQ, sUnloadQR);
                oModel.read("/QRCodeSet", {
                    filters: [aFilter],
                    urlParameters: {
                        "$expand": "OuterPackagingId,InnerPackagingId"
                    },
                    success: function (oData) {
                        var oQRDetails = oData.results[0];
                        oViewHandlingModel.setProperty("/unloadQrType", oQRDetails.Type)
                        oDetails.sBindingPath = oDetails.controller._getQRTableIndex(oQRDetails);
                        if (oDetails.sBindingPath && (oQRDetails.Type === "INNER" || oQRDetails.Type === "OUTER")) {
                            if (!this.InputRcvdQty) {
                                this.InputRcvdQty = Fragment.load({
                                    id: oDetails.view.getId(),
                                    name: "com.agel.mmts.unloadmaterial.view.fragments.unloadMaterial.inputRcvdQty",
                                    controller: oDetails.controller
                                }).then(function (oDialog) {
                                    // connect dialog to the root view of this component (models, lifecycle)
                                    oDetails.view.addDependent(oDialog);
                                    oDialog.bindElement({
                                        path: oDetails.sBindingPath
                                    });
                                    if (Device.system.desktop) {
                                        oDialog.addStyleClass("sapUiSizeCompact");
                                    }
                                    oDialog.setTitle(oDetails.title + oQRDetails.Type);
                                    return oDialog;
                                });
                            }
                            if (this.scanqrDialog) {
                                this.scanqrDialog.then(function (oDialog) {
                                    oDialog.close();
                                });
                            }
                            if (this.InputRcvdQty) {
                                this.InputRcvdQty.then(function (oDialog) {
                                    oDialog.bindElement({
                                        path: oDetails.sBindingPath
                                    });
                                    oDialog.setTitle(oDetails.title + oQRDetails.Type);
                                    oDialog.open();
                                });
                            }
                        }
                        else {
                            MessageBox.information("Please scan Inner or outer packaging QR");
                        }

                    }.bind(this),
                    error: function (oError) { }
                });
            },

            _getQRTableIndex: function (oQRDetails) {
                var oJSONModelData = this.getViewModel("JSONModelData").getData();
                var sPath = "";
                if (oQRDetails.Type === "INNER") {
                    var sInnerID = oQRDetails.InnerPackagingId.ID;
                    var index = oJSONModelData.InnerPackings.findIndex(oPacking => oPacking.InnerPackagingId === sInnerID);
                    if (index >= 0)
                        oJSONModelData.InnerPackings[index].QRNumber = oQRDetails.QRNumber;
                    sPath = "JSONModelData>/InnerPackings/" + index + "/";
                }
                else if (oQRDetails.Type === "OUTER") {
                    var sOuterID = oQRDetails.OuterPackagingId.ID;
                    index = oJSONModelData.OuterPackings.findIndex(oPacking => oPacking.OuterPackagingId === sOuterID);
                    if (index >= 0)
                        oJSONModelData.OuterPackings[index].QRNumber = oQRDetails.QRNumber;
                    sPath = "JSONModelData>/OuterPackings/" + index + "/";
                }
                return sPath;
            },

            onRcvdQtySubmit: function () {
                var oOuterInput = this.getView().byId("idRcvdQtyOuter");
                var oInnerInput = this.getView().byId("idRcvdQtyInner");
                var oJSONData = this.getViewModel("JSONModelData").getData();
                if (this.InputRcvdQty && oOuterInput.getValueState() !== "Error" && oInnerInput.getValueState() !== "Error") {
                    this.InputRcvdQty.then(function (oDialog) {
                        oDialog.close();
                    });
                }
                this.getViewModel("oViewHandlingModel").setProperty("/unloadQrCode", null);
                this.getViewModel("oViewHandlingModel").setProperty("/unloadQrType", null);
                var bInnerUnloadComplete = oJSONData.InnerPackings.every(oPacking => oPacking.ReceivedQty);
                var bOuterUnloadComplete = oJSONData.OuterPackings.every(oPacking => oPacking.ReceivedInnerCount);
                this.getViewModel("oViewHandlingModel").setProperty("/unloadingComplete", bInnerUnloadComplete && bOuterUnloadComplete);
                if (bInnerUnloadComplete && bOuterUnloadComplete) {
                    this.getView().byId("idUnloadingComplete").setVisible(true);
                    var bInnerMismatch = oJSONData.InnerPackings.some(oPacking => Number(oPacking.ReceivedQty) != Number(oPacking.PackagingQty));
                    var bOuterMismatch = oJSONData.OuterPackings.some(oPacking => Number(oPacking.ReceivedInnerCount) != Number(oPacking.InnerPackagingCount));
                    this.getViewModel("oViewHandlingModel").setProperty("/unloadingMismatch", bInnerMismatch || bOuterMismatch);
                }
            },

            onRcvdQtyCancel: function () {
                this.getView().byId("idRcvdQtyOuter").setValue("");
                this.getView().byId("idRcvdQtyInner").setValue("");
                if (this.InputRcvdQty) {
                    this.InputRcvdQty.then(function (oDialog) {
                        oDialog.close();
                    });
                }
                this.getViewModel("oViewHandlingModel").setProperty("/unloadQrCode", null);
                this.getViewModel("oViewHandlingModel").setProperty("/unloadQrType", null);
                this.getViewModel("oViewHandlingModel").setProperty("/unloadingComplete", false);
                this.getView().byId("idUnloadingComplete").setVisible(false);
            },

            onInputRcvdQtyOuter: function (oEvent) {
                var oInput = oEvent.getSource();
                var sInputQty = oInput.getValue();
                var sMaxValue = this.getView().byId("idExpectedQtyOuter").getText();
                if (sInputQty && Number(sInputQty) > Number(sMaxValue)) {
                    oInput.setValueState("Error");
                    oInput.setValueStateText("Received Quantity cannot be more than expected quantity.");
                }
                else {
                    oInput.setValueState("None");
                    oInput.setValueStateText("");
                }
            },

            onInputRcvdQtyInner: function (oEvent) {
                var oInput = oEvent.getSource();
                var sInputQty = oInput.getValue();
                var sMaxValue = this.getView().byId("idExpectedQtyInner").getText();
                if (sInputQty && (Number(sInputQty) > Number(sMaxValue) || Number(sInputQty) < 0)) {
                    oInput.setValueState("Error");
                    oInput.setValueStateText("Received Quantity cannot be more than expected quantity or negative.");
                }
                else {
                    oInput.setValueState("None");
                    oInput.setValueStateText("");
                }
            },

            onUnloadingComplete: function () {
                var bMismatch = this.getViewModel("oViewHandlingModel").getProperty("/unloadingMismatch");
                var oDetails = [];
                oDetails.controller = this;
                oDetails.view = this.getView();
                oDetails.title = "Update Packing List";
                if (bMismatch) {
                    if (!this.unloadConfirmDialog) {
                        this.unloadConfirmDialog = Fragment.load({
                            id: oDetails.view.getId(),
                            name: "com.agel.mmts.unloadmaterial.view.fragments.unloadMaterial.unloadingCompleteConfirmation",
                            controller: oDetails.controller
                        }).then(function (oDialog) {
                            // connect dialog to the root view of this component (models, lifecycle)
                            oDetails.view.addDependent(oDialog);
                            if (Device.system.desktop) {
                                oDialog.addStyleClass("sapUiSizeCompact");
                            }
                            oDialog.setTitle(oDetails.title);
                            return oDialog;
                        });
                    }
                    this.unloadConfirmDialog.then(function (oDialog) {
                        oDialog.open();
                    });
                }
                else {
                    this.onUnloadingConfirmationSubmit();
                }
            },

            onUnloadingConfirmationSubmit: function () {
                var oView = this.getView();
                var oModel = this.getViewModel();
                var oData = this.getViewModel("JSONModelData").getData();
                var sStatusChangePath = "/PackingListEdmSet(" + this.RequestId + ")";
                var oPayload = {
                    "ID": this.RequestId,
                    "Status": "UNLOADING COMPLETED"
                }
                oModel.create("/UnloadMaterialRequestSet", oData, {
                    success: (oResponse) => {
                        if (oResponse.Success) {
                            var oMainModel = oView.getModel();
                            oMainModel.update(sStatusChangePath, oPayload, {
                                success: (oResp) => {
                                    oView.byId("idQRnotFound").setVisible(false);
                                    oView.byId("idUnloadingComplete").setVisible(false);
                                    oView.byId("idDoitLater").setVisible(true);
                                    oView.byId("idScanQR").setVisible(false);
                                    oView.byId("idRequestGRN").setVisible(true);
                                },
                                error: (e) => { MessageBox.error("Failed to Update Packing List Status.") }
                            })
                        }
                        else {
                            MessageBox.error(oResponse.Message);
                        }
                    },
                    error: (e) => {
                        // MessageBox.error("Error while Unloading Material.");
                    }
                })

                if (this.unloadConfirmDialog) {
                    this.unloadConfirmDialog.then(function (oDialog) {
                        oDialog.close();
                    });
                }
            },

            _filterQrSuggestion: function (oEvent) {
                var oInput = oEvent.getSource();
                var oValue = oInput.getValue();
                var aFilters = [];
                if (oValue) {
                    aFilters.push(new Filter("QRNumber", sap.ui.model.FilterOperator.Contains, oValue));
                    oInput.getBinding("suggestionItems").filter(aFilters);
                }
            },

            onUnloadingConfirmationCancel: function () {
                if (this.unloadConfirmDialog) {
                    this.unloadConfirmDialog.then(function (oDialog) {
                        oDialog.close();
                    });
                }
            },

            onDoItLaterPress: function () {
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.navTo("RouteApp", true);
            },

            handleSelectionChange: function (oEvent) {
                var aGRNItems = this.getView().getModel("requestModel").getProperty("/GRNItems"),
                    oGRMItem = {
                        RestrictedStoreStockParentId: oEvent.getSource().getParent().getBindingContext().getObject().ID,
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
                var sPlantCode = oEvent.getSource().getParent().getBindingContext().getObject().PlantCode;
                var oMaterialCodeFilter = new sap.ui.model.Filter("MaterialCode", sap.ui.model.FilterOperator.EQ, sMaterialCode);
                var oPlantCodeFilter = new sap.ui.model.Filter("ValuationArea", sap.ui.model.FilterOperator.EQ, sPlantCode);
                oEvent.getSource().getBinding("items").filter([oMaterialCodeFilter, oPlantCodeFilter]);
            },

            onRequestGRNPress: function (oEvent) {
                var sParentItemPath = this.getView().getBindingContext().sPath;
                var requestModel = new JSONModel({
                    MovementType: "101 - GRN",
                    quantity: null,
                    delivery: null,
                    billoflading: null,
                    gatepassnumber: null,
                    lrnumber: null,
                    reference: null,
                    valueState: null,
                    isConfirmButtonEnabled: false,
                    valueStateText: "",
                    GRNItems: []
                });
                this.getView().setModel(requestModel, "requestModel");

                // if (!this._oRequestDialog) {
                this._oRequestDialog = sap.ui.xmlfragment("com.agel.mmts.unloadmaterial.view.fragments.common.ViewRequestGRNDialog", this);
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
                    //this.getViewModel("requestModel").setProperty("/isConfirmButtonEnabled", true);
                    oEvent.getSource().setValueState("None");
                    oEvent.getSource().setValueStateText("");
                }
                else {
                    //this.getViewModel("requestModel").setProperty("/isConfirmButtonEnabled", false);
                    oEvent.getSource().setValueState("Error");
                    oEvent.getSource().setValueStateText("Weight should be more than 0.");
                }

                if (parseFloat(oEvent.getSource().getValue()) > parseFloat(oGRNData.TotalWeight) || parseFloat(oEvent.getSource().getValue()) <= 0) {
                    // sap.m.MessageBox.error("Total Packaging Weight should more than 0 and not exceed Total Vendor Entered Weight.");
                    //this.getViewModel("requestModel").setProperty("/isConfirmButtonEnabled", false);
                    oEvent.getSource().setValueState("Error");
                    oEvent.getSource().setValueStateText("Weight should be less than total weight.");
                }
                else {
                    //this.getViewModel("requestModel").setProperty("/isConfirmButtonEnabled", true);
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
                sStorageLocation = this.getViewModel("requestModel").getProperty("/StorageLocation");

                if (sDelivery && sQuantity && sBillofLading && sReference && sLRNumber && sStorageLocation)
                    this.getViewModel("requestModel").setProperty("/isConfirmButtonEnabled", true);
                else
                    this.getViewModel("requestModel").setProperty("/isConfirmButtonEnabled", false);
            },
            onRequestPress: function (oEvent) {
                var sDelivery = this.getViewModel("requestModel").getProperty("/delivery");
                var sQuantity = this.getViewModel("requestModel").getProperty("/quantity");
                var sBillofLading = this.getViewModel("requestModel").getProperty("/billoflading");
                var sReference = this.getViewModel("requestModel").getProperty("/reference");
                var sGatePassNumber = this.getViewModel("requestModel").getProperty("/gatepassnumber");
                var sLRNumber = this.getViewModel("requestModel").getProperty("/lrnumber");
                var sStorageLocation = this.getViewModel("requestModel").getProperty("/StorageLocation");
                var oModel = this.getComponentModel(),
                    aGRNItems = this.getView().getModel("requestModel").getProperty("/GRNItems");
                if (!sDelivery || !sQuantity || !sBillofLading || !sReference || !sLRNumber || !sStorageLocation) {
                    sap.m.MessageBox.error("Please fill all required fields.");
                    return;
                }
                if (aGRNItems.length === 0) {
                    sap.m.MessageToast.show("Please provide items to request GRN.");
                    return;
                }
                else {
                    if (parseInt(sQuantity) > 0) {
                        if (sDelivery !== null) {
                            var oPayload = {
                                "QTY": parseInt(sQuantity),
                                "DeliveryNote": sDelivery,
                                "BillOfLading": sBillofLading,
                                "GatePassNumber": sGatePassNumber,
                                "LRNumber": sLRNumber,
                                "StorageLocation": sStorageLocation,
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
                                "GatePassNumber": sGatePassNumber,
                                "LRNumber": sLRNumber,
                                "StorageLocation": sStorageLocation,
                                "Reference": sReference,
                                "PackingListId": parseInt(oSelectedItemData.ID),
                                "UserName": "Agel_Sep",
                                "GRNItems": aGRNItems
                            };
                        }
                        if (oPayload) {
                            this.getViewModel("objectViewModel").setProperty("/busy", true);
                            oModel.create("/GRNEdmSet", oPayload, {
                                success: function (oData) {
                                    this.getViewModel("objectViewModel").setProperty("/busy", false);
                                    if (oData.Success) {
                                        MessageBox.success(oData.Message, {
                                            title: "Success",
                                            onClose: function (oAction1) {
                                                if (oAction1 === sap.m.MessageBox.Action.OK) {
                                                    this.getComponentModel().refresh();
                                                    this.onDoItLaterPress();
                                                }
                                            }.bind(this)
                                        });
                                    }
                                    else
                                        sap.m.MessageBox.error(oData.Message);
                                }.bind(this),
                                error: function (oError) {
                                    this.getViewModel("objectViewModel").setProperty("/busy", false);
                                    // MessageBox.error(JSON.stringify(oError));
                                }
                            });
                        }
                    } else {
                        MessageBox.error("Please enter positive and a non zero number for Quantity")
                    }
                    this._oRequestDialog.close();
                }
            },

            // onMapVendorQRSuccess: function (oEvent) {
            //     debugger;
            //     if (oEvent.mParameters.getParameter("cancelled")) {
            //         sap.m.MessageToast.show("Scan cancelled", { duration: 1000 });
            //     } else {
            //         var sScannedValue = oEvent.getParameter("mParameters").getText();
            //         sap.m.MessageToast.show("Scanned: " + sScannedValue, { duration: 2000 });
            //         if (sScannedValue.length > 0) {
            //             var sPath = oEvent.getSource().getBindingContext("JSONModelData").sPath;
            //             this.getViewModel("JSONModelData").getProperty(sPath);
            //         }
            //     }
            // },

            // onMapVendorQRFail: function (oEvent) {
            //     sap.m.MessageToast.show("Scan failed" + oEvent, { duration: 1000 });
            // }

        });
    });
