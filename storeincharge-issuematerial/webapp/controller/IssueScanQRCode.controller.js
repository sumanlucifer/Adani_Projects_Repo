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
    "sap/m/Dialog",
    '../utils/formatter',
], function (BaseController, JSONModel, Filter, FilterOperator, Fragment, Sorter, Device, History, ColumnListItem, Input, deepExtend, Spreadsheet, MessageToast, MessageBox, ObjectIdentifier, Text, Button, Dialog, formatter) {
    "use strict";

    return BaseController.extend("com.agel.mmts.storeinchargeissuematerial.controller.IssueScanQRCode", {
        formatter: formatter,
        onInit: function () {
            this.getView().addEventDelegate({
                onAfterShow: this.onBeforeShow,
            }, this);
            //view model instatiation
            var oViewModel = new JSONModel({
                busy: false,
                delay: 0,
                boqSelection: null,
                csvFile: "file",
                doneButton: false,
                reserveButton: true
            });
            this.setModel(oViewModel, "objectViewModel");

            //    this._initializeCreationModels();
            this.MainModel = this.getComponentModel();
            this.getView().setModel(this.MainModel);

            // Keeps reference to any of the created sap.m.ViewSettingsDialog-s in this sample
            this._mViewSettingsDialogs = {};

            //Router Object
            this.oRouter = this.getRouter();
            this.oRouter.getRoute("RaiseIssueScanQRCode").attachPatternMatched(this._onObjectMatched, this);
        },

        _onObjectMatched: function (oEvent) {
            this.sObjectId = oEvent.getParameter("arguments").ID;
            this._bindView("/IssuedMaterialReserveSet" + this.sObjectId);

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
                        that.readJSONModel();
                    }
                }
            });
        },

        handleToIssueMatBreadcrumPress: function () {
            this.getRouter().navTo("RouteLandingPage");
        },

        readJSONModel: function () {

            var oDataModel = this.getViewModel();
            oDataModel.read("/IssuedMaterialReserveSet" + this.sObjectId, {
                urlParameters: { "$expand": "IssuedMaterialReservedItems/IssuedMaterialReservedBOQItems" },
                success: function (oData) {
                    if (oData) {
                        // debugger;
                        oData.IssuedMaterialReservedItems.results.forEach(element => {
                            element.IssuedQty = null;
                            // element.IssueMaterialBOQItems = [];
                            element.WBSNumber = oData.WBSNumber;
                            element.QRNumber = null;
                            element.IssueMaterialPostingBOQs = element.IssuedMaterialReservedBOQItems.results;
                            if (element.BaseUnit === 'MT')
                                element.QtyEditable = false;
                            else
                                element.QtyEditable = true;
                            element.IssueMaterialPostingBOQs.forEach(item => {
                                item.IssueMaterialReserveBOQId = item.ID;
                                item.IssuedQty = null;
                                item.BaseUnit = item.UOM;
                                if (element.BaseUnit === 'MT')
                                    item.QtyEditable = true;
                                else
                                    item.QtyEditable = false;
                            })
                        });
                    }
                    var oJsonModel = new JSONModel(oData.IssuedMaterialReservedItems.results);
                    this.getView().setModel(oJsonModel, "IssueMatModel");
                }.bind(this),
                error: function (oError) {
                    sap.m.MessageBox.error(JSON.stringify(oError));
                }
            });

        },

        onPressScanQR: function (oEvent) {
            if (!this._oScannerDialog) {
                this._oScannerDialog = sap.ui.xmlfragment("com.agel.mmts.storeinchargeissuematerial.view.fragments.common.ScannerFragment", this);
                this.getView().addDependent(this._oScannerDialog);
            }
            this._oScannerDialog.open();
        },

        onQRCodeScanDialogClosePress: function (oEvent) {
            this._oScannerDialog.close();
        },

        readJSONEnterQtyModel: function (qrCodeId) {

            var QRNumberFilter = new sap.ui.model.Filter({
                path: "QRNumber",
                operator: sap.ui.model.FilterOperator.EQ,
                value1: qrCodeId
            });

            var filter = [];
            filter.push(QRNumberFilter);
            var oDataEnterQtyModel = this.getViewModel();
            oDataEnterQtyModel.read("/MapQRLineItemSet", {
                urlParameters: {
                    "$expand": "RestrictedStoreStockParent/StoreStockParent,RestrictedStoreStockBOQ/StoreStockBOQ"
                },
                filters: [filter],
                success: function (oData) {
                    if (oData) {
                        if (oData.results[0] != undefined) {
                            if (oData.results[0].RestrictedStoreStockParent.StoreStockParent != undefined) {
                                var finalMatCode = oData.results[0].RestrictedStoreStockParent.StoreStockParent.MaterialCode;
                                var initialMatModel = this.getViewModel("IssueMatModel").getData();
                                for (var j = 0; j < initialMatModel.length; j++) {
                                    if (initialMatModel[j].MaterialCode === finalMatCode) {
                                        initialMatModel[j].QRNumber = qrCodeId;
                                        this.onEnterQuantity(j);
                                    }
                                    else
                                        sap.m.MessageBox.error("Invalid Scan");
                                }
                            }
                            else
                                sap.m.MessageBox.error("Invalid Scan");
                        }
                        else
                            sap.m.MessageBox.error("Invalid Scan");
                    }
                }.bind(this),
                error: function (oError) {
                    sap.m.MessageBox.error(JSON.stringify(oError));
                }
            });
        },

        onEnterQuantity: function (bindingContext) {
            var oDetails = {};
            oDetails.controller = this;
            oDetails.view = this.getView();
            oDetails.sParentItemPath = bindingContext;
            oDetails.title = "Enter Quantity";
            if (!this._oScannerDialog1) {
                this._oScannerDialog1 = Fragment.load({
                    id: oDetails.view.getId(),
                    name: "com.agel.mmts.storeinchargeissuematerial.view.fragments.common.EnterQuantity",
                    controller: oDetails.controller
                }).then(function (oDialog) {
                    // connect dialog to the root view of this component (models, lifecycle)
                    oDetails.view.addDependent(oDialog);
                    // debugger;
                    oDialog.setBindingContext(oDetails.view.getModel("IssueMatModel").getContext("/" + oDetails.sParentItemPath));

                    oDialog.setModel(oDetails.view.getModel("IssueMatModel"));
                    if (Device.system.desktop) {
                        oDialog.addStyleClass("sapUiSizeCompact");
                    }
                    oDialog.setTitle(oDetails.title);
                    return oDialog;
                });
            }

            this._oScannerDialog1.then(function (oDialog) {
                oDetails.view.addDependent(oDialog);
                oDialog.setBindingContext(oDetails.view.getModel("IssueMatModel").getContext("/" + oDetails.sParentItemPath));
                oDialog.open();
            });

        },

        onIssuedQtyLivechange: function (oEvent) {
            debugger;
            var sQtyRemainingToIssue = parseFloat(oEvent.getSource().getParent().getBindingContext().getObject().QtyRemainingToIssue),
                sIssuedValue = parseFloat(oEvent.getSource().getValue());
            var oBindingObject = oEvent.getSource().getBindingContext().getObject();
            var oModel = oEvent.getSource().getModel();

            if (sIssuedValue > sQtyRemainingToIssue || sIssuedValue <= 0 || isNaN(sIssuedValue)) {
                oEvent.getSource().setValueState("Error");
                oEvent.getSource().setValueStateText("Please enter valid quantity");
                this.getView().byId("idSaveQtyBTN").setEnabled(false);
            } else {
                oEvent.getSource().setValueState("None");
                this.getView().byId("idSaveQtyBTN").setEnabled(true);
                if (oBindingObject.IssueMaterialPostingBOQs) {
                    oBindingObject.IssueMaterialPostingBOQs.forEach(item => {
                        item.IssuedQty = sIssuedValue * (item.ReservedQty / oBindingObject.ReservedQty);
                    })
                }
                else {
                    var iParentContext = oEvent.getSource().getBindingContext().getPath().split("/")[1];
                    var oParentObject = oModel.getData()[iParentContext];
                    var iTotalQty = oParentObject.IssuedQty;
                    if (iTotalQty)
                        iTotalQty = parseFloat(iTotalQty);
                    else
                        iTotalQty = 0;
                    var iPrvQty = oBindingObject.IssuedQty;
                    if (iPrvQty)
                        iPrvQty = parseFloat(iPrvQty);
                    else
                        iPrvQty = 0;
                    iTotalQty = iTotalQty + ((sIssuedValue - iPrvQty) * oBindingObject.WeightPerPiece);
                    oModel.setProperty(oEvent.getSource().getBindingContext().getPath() + "/IssuedQty", sIssuedValue);
                    oModel.setProperty("/" + iParentContext + "/IssuedQty", iTotalQty);
                }
                oModel.refresh();
            }
        },

        onEnterQuantityDialogClosePress: function (oEvent) {
            var oDetails = {};
            oDetails.controller = this;
            oDetails.view = this.getView();
            var jsonDataDoneButton = oDetails.view.getModel("IssueMatModel").getData();
            var iIndex = null;
            for (var i = 0; i < jsonDataDoneButton.length; i++) {
                iIndex = jsonDataDoneButton.findIndex(function (oItem) {
                    return parseFloat(oItem.IssuedQty) > parseFloat(oItem.QtyRemainingToIssue) || parseFloat(oItem.IssuedQty) <= 0 || isNaN(oItem.IssuedQty);
                });
            }

            if (iIndex >= 0) {
                MessageToast.show("Please check out issued quantity for the given line items");
                oDetails.view.getModel("objectViewModel").setProperty("/doneButton", true);
            }
            else {
                oDetails.view.getModel("objectViewModel").setProperty("/doneButton", true);
                this._oScannerDialog1.then(function (oDialog) {
                    oDialog.close();
                });
            }
        },

        onEnterQuantityDialogCancelPress: function (oEvent) {
            this.getView().byId("idInputIssuedQty").setValue(null);
            this._oScannerDialog1.then(function (oDialog) {
                oDialog.close();
            });
        },

        // On Submit QR Histroy
        onPressSubmitQRCode: function () {
            var that = this;
            var qrCodeId = sap.ui.getCore().byId("idInputQRCode").getValue();
            this.readJSONEnterQtyModel(qrCodeId);
        },


        // validateQRCode: function () {
        //     var that = this;
        //     var qrCodeId = sap.ui.getCore().byId("idInputQRCode").getValue();
        //     // var QRNumberFilter = new sap.ui.model.Filter({
        //     //     path: "QRNumber",
        //     //     operator: sap.ui.model.FilterOperator.EQ,
        //     //     value1: qrCodeId
        //     // });

        //     // var PACKINGLISTFilter = new sap.ui.model.Filter({
        //     //     path: "Type",
        //     //     operator: sap.ui.model.FilterOperator.EQ,
        //     //     value1: 'INNER'
        //     // });
        //     // var filter = [];
        //     // filter.push(QRNumberFilter);
        //     // filter.push(PACKINGLISTFilter);
        //     // var sPath = "/QRCodeSet?$filter=QRNumber eq '" + qrCodeId + "' and Type eq 'INNER'&$expand=PackingList"
        //     // var sPath = "/IssueMaterialQREdmSet"

        //     var aPayload = {
        //         "QRNumber":qrCodeId
        //     };

        //     // this.MainModel.create("/IssueMaterialQREdmSet", aPayload, {

        //     this.MainModel.read("/MapQRLineItemSet", aPayload, {

        //     // this.MainModel.create("/IssueMaterialQREdmSet", {
        //     //     // urlParameters: {
        //     //     //     "$expand": "PackingList"
        //     //     // },
        //     //     filters: [filter],
        //         success: function (oData, oResponse) {
        //             if (oData) {
        //                 // debugger;
        //                 if (oData) {
        //                     // sap.m.MessageBox.success("QR Code is valid");
        //                     this.onQRCodeScanDialogClosePress();
        //                     this.onEnterQuantity();

        //                 } else {
        //                     sap.m.MessageBox.error("Please Enter Valid  QR Code");
        //                 }
        //             } else {
        //                 sap.m.MessageBox.error("Please Enter Valid QR Code");
        //             }
        //         }.bind(this),
        //         error: function (oError) {
        //             sap.m.MessageBox.error(JSON.stringify(oError));
        //         }
        //     });
        // }

        onPressDone: function (oEvent) {
            // debugger;
            var oDetails = {};
            oDetails.controller = this;
            oDetails.view = this.getView();
            var Matdata = oDetails.view.getModel("IssueMatModel").getData();

            var aPayload = {
                "IssuedMaterialId": null,
                "IssuedMaterialReserveId": this.sObjectId.match(/\((.*?)l/)[1],
                "IssueMaterialPostingParents": Matdata
            };

            for (var i = 0; i < Matdata.length; i++) {
                if (!Matdata[i].IssuedQty)
                    Matdata.splice(i, 1);
                else {
                    for (var j = 0; j < Matdata[i].IssueMaterialPostingBOQs.length; j++) {
                        if (!Matdata[i].IssueMaterialPostingBOQs[j].IssuedQty)
                            Matdata[i].IssueMaterialPostingBOQs.splice(j, 1);
                    }
                }
            }

            // IssueMaterialParentItems

            // for(var i=0; i<Matdata.length; i++){
            //     var oItem={ 
            //        [
            //     {
            //         "MaterialCode": Matdata[i].MaterialCode,
            //         "IssuedQty": Matdata[i].IssuedQty,
            //         "IssueMaterialBOQItems": [ ]  
            //     }
            // ] 

            //     }
            // }

            this.MainModel.create("/IssueMaterialEdmSet", aPayload, {
                success: function (oData, oResponse) {
                    if (oData.Success)
                        this.onPressNavigation(oData.ID);
                    else
                        sap.m.MessageBox.error(oData.Message);
                }.bind(this),
                error: function (oError) {
                    sap.m.MessageBox.error(JSON.stringify(oError));
                }
            });
        },

        onPressNavigation: function (id) {
            var that = this;
            that.getRouter().navTo("RaiseIssueUploadDoc", {
                ID: id
            });
        }



    });
});