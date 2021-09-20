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
],
	/**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (BaseController, JSONModel, Filter, FilterOperator, Fragment, Sorter, Device, History, ColumnListItem, Input, jquery, MessageBox, MessageToast, formatter) {
        "use strict";
        return BaseController.extend("com.agel.mmts.securityscanqr.controller.QRCodeDetails", {
            formatter: formatter,

            onInit: function () {
                jquery.sap.addUrlWhitelist("blob");

                this.getView().addEventDelegate({
                    onAfterShow: this.onViewLoaded,

                }, this);

                //view model instatiation
                var oViewModel = new JSONModel({
                    busy: true,
                    delay: 0
                });
                this.setModel(oViewModel, "objectViewModel");
                // this.isCreated = false;

                var oViewHandlingModel = new JSONModel({
                    "EnterVehicleNo": null,
                    "ReEnterVehicleNo": null,
                    //     HeaderDeclineButton : false
                    "wantChange": false,
                    "closeButton": false,
                    "submitButton": true,
                    "ReEnterVehicleNoNew": null

                });
                this.setModel(oViewHandlingModel, "oViewHandlingModel");

                this.MainModel = this.getComponentModel();
                this.getView().setModel(this.MainModel);

                //Router Object
                this.oRouter = this.getRouter();
                this.oRouter.getRoute("QRCodeDetailsPage").attachPatternMatched(this._onObjectMatched, this);

            },

            onViewLoaded: function (evt) {
                this.onSaveScanQrCode();
            },

            // On Object Matched 
            _onObjectMatched: function (oEvent) {
                var that = this;
                // debugger;

                if (oEvent.getParameters().arguments.Type === "QR") {
                    this.qrCodeID = oEvent.getParameters().arguments.QRNo;
                    this._bindView("/QRCodeSet(" + this.qrCodeID + ")/PackingList");
                }
                else {
                    this.qrCodeID = oEvent.getParameters().arguments.QRNo;
                    this._bindView("/QRCodeSet(" + this.qrCodeID + ")/PackingList");
                }

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
                            // if(!that.isCreated)
                            objectViewModel.setProperty("/busy", false);
                            // that.onSaveScanQrCode();
                        }
                    }
                });
            },

            onSaveScanQrCode: function () {
                var that = this;
                // debugger;
                if (this.getView().getBindingContext().getObject().ID.length) {
                    var PackingListId = this.getView().getBindingContext().getObject().ID;
                    var PONumber = this.getView().getBindingContext().getObject().PONumber;
                    var userInfo = 1;
                    // var userInfo = sap.ushell.Container.getService("UserInfo").getId();
                    var oPayload = {
                        "QRCodeId": parseInt(that.qrCodeID),
                        // "PackingListId": PackingListId,
                        "UserId": userInfo,
                        // "PONumber": PONumber
                    };
                    // debugger;
                    this.MainModel.create("/ScannedMaterialEdmSet", oPayload, {
                        success: function (oData, oResponse) {
                            that.scannedMaterialID = oData.ID;
                            // objectViewModel.setProperty("/busy", false);
                            // sap.m.MessageBox.success("Scanned QR Code Stored Successfully");
                        }.bind(this),
                        error: function (oError) {
                            // objectViewModel.setProperty("/busy", false);
                            sap.m.MessageBox.error(JSON.stringify(oError));
                        }
                    });
                } else {
                    sap.m.MessageBox.error("Oops! Error occured please try again in sometime.");
                }

            },

            // On change vehicle number
            onChangeVehicleNumberPress: function () {
                //var bWantCeNumberPress: function () {
                var bWantChange = this.getViewModel("oViewHandlingModel").getProperty("/wantChange");
                if (bWantChange) {
                    this.getViewModel("oViewHandlingModel").setProperty("/wantChange", false);
                } else {
                    this.getViewModel("oViewHandlingModel").setProperty("/wantChange", true)
                }
            },

            // On Submit Press - 
            onVehicleNumberSubmit: function (oEvent) {

                var that = this;
                var obj = oEvent.getSource().getBindingContext().getObject();
                var newVehiclenumber = this.getView().getModel("oViewHandlingModel").oData.ReEnterVehicleNo;
                var emptyVehiclenumber = this.getView().getModel("oViewHandlingModel").oData.ReEnterVehicleNoNew;

                if (newVehiclenumber) {
                    var oVehicleNob = newVehiclenumber;
                }
                else if (emptyVehiclenumber) {
                    var oVehicleNob = emptyVehiclenumber;
                }
                else {
                    var oVehicleNob = obj.VehicleNumber;
                }

                var vehicleRegExp = new RegExp('^[A-Z]{2}[ -][0-9]{1,2}(?: [A-Z])?(?: [A-Z]*)? [0-9]{4}$');
                if (vehicleRegExp.test(oVehicleNob)) {
                    var oPayload = {
                        "PackingListId": obj.ID,
                        "VehicleNumber": oVehicleNob,
                        "ScannedMaterialId": that.scannedMaterialID
                    };

                    this.MainModel.create("/VehicleNumberUpdateSet", oPayload, {

                        success: function (oData, oResponse) {
                            this.MainModel.refresh();
                            MessageBox.success("Vehicle Number Submitted successfully");
                            this.getViewModel("oViewHandlingModel").setProperty("/wantChange", false);
                            this.getViewModel("oViewHandlingModel").setProperty("/closeButton", true);
                            this.getViewModel("oViewHandlingModel").setProperty("/submitButton", false);

                        }.bind(this),
                        error: function (oError) {
                            MessageBox.error(JSON.stringify(oError));
                        }.bind(this)
                    });
                    // this.MainModel.refresh();
                    this.getViewModel("oViewHandlingModel").setProperty("/ReEnterVehicleNo", null);
                } else {
                    sap.m.MessageBox.error("Oops! Looks like you've entered a wrong vehicle number.")
                }


            },

            onClose: function (oEvent) {
                this.oRouter.navTo("ScanQrCodePage");
            },

            // QR Code View 
            onViewQRCodePress: function (oEvent) {
                var sParentItemPath = oEvent.getParameter("oSource").getBindingContext().getPath();
                var sDialogTitleObject = oEvent.getSource()._getBindingContext().getProperty();
                var oDetails = {};
                oDetails.controller = this;
                oDetails.view = this.getView();
                oDetails.sParentItemPath = sParentItemPath;
                oDetails.title = "QR Code";
                if (sDialogTitleObject.Name)
                    oDetails.title = sDialogTitleObject.Name;
                else if (sDialogTitleObject.PackagingType)
                    oDetails.title = sDialogTitleObject.PackagingType;
                if (!this.qrDialog) {
                    this.qrDialog = Fragment.load({
                        id: oDetails.view.getId(),
                        name: "com.agel.mmts.securityscanqr.view.fragments.QRCodeViewer",
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
                this.qrDialog.then(function (oDialog) {
                    oDetails.view.addDependent(oDialog);
                    oDialog.bindElement({
                        path: oDetails.sParentItemPath,
                    });
                    oDialog.setTitle(oDetails.title);
                    oDialog.open();
                });
            },

            onQRCodeViewerDialogClosePress: function (oEvent) {
                this.qrDialog.then(function (oDialog) {
                    oDialog.close();
                });
            },

            onViewQRCodePress1: function (oEvent) {
                var sParentItemPath = oEvent.getSource().getBindingContext().getPath();
                var sDialogTitleObject = oEvent.getSource()._getBindingContext().getProperty();
                var oDetails = {};
                oDetails.controller = this;
                oDetails.view = this.getView();
                oDetails.sParentItemPath = sParentItemPath;
                oDetails.title = "QR Code";
                if (sDialogTitleObject.Name)
                    oDetails.title = sDialogTitleObject.Name;
                else if (sDialogTitleObject.PackagingType)
                    oDetails.title = sDialogTitleObject.PackagingType;
                if (!this.qrDialog) {
                    this.qrDialog = Fragment.load({
                        id: oDetails.view.getId(),
                        name: "com.agel.mmts.securityscanqr.view.fragments.QRCodeViewer",
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
                this.qrDialog.then(function (oDialog) {
                    oDetails.view.addDependent(oDialog);
                    oDialog.bindElement({
                        path: oDetails.sParentItemPath,
                    });
                    oDialog.setTitle(oDetails.title);
                    oDialog.open();
                });
            },

            onVechileNumerValueUpdate: function (oEvent) {
                var Vehiclenumber = this.getView().getModel("oViewHandlingModel").oData.ReEnterVehicleNo;
                if (Vehiclenumber === "")
                    this.getViewModel("oViewHandlingModel").setProperty("/ReEnterVehicleNo", null);
            }

        });
    });
