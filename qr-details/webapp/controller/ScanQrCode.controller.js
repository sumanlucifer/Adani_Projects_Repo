sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    // "sap/ui/core/Fragment",
    // "sap/ui/model/Sorter",
    // "sap/ui/Device",
    // "sap/ui/core/routing/History",
    // "sap/m/ColumnListItem",
    "sap/m/Input"
],
	/**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (BaseController, JSONModel, Filter, FilterOperator, Input) {
        "use strict";

        return BaseController.extend("com.agel.mmts.qrdetails.controller.ScanQrCode", {

            onInit: function () {

                //view model instatiation
                var oViewModel = new JSONModel({
                    busy: true,
                    delay: 0
                });
                this.setModel(oViewModel, "objectViewModel");

                var oViewModel = new JSONModel({
                    "submitQRCode": false,
                    "scanQRCode": true,
                    "submitInvoiceCode": false,
                    "inputQRCode": true,
                    "inputInvoiceCode": true

                });
                this.setModel(oViewModel, "oViewModel");

                // Main Model Set
                this.MainModel = this.getComponentModel();
                this.getView().setModel(this.MainModel);

                //Router Object
                this.oRouter = this.getRouter();
                this.oRouter.getRoute("ScanQrCodePage").attachPatternMatched(this._onObjectMatched, this);
            },

            _onObjectMatched: function (oEvent) {
                var that = this;
                // var sObjectId = oEvent.getParameter("arguments").PackingListId;
                // this.sObjectId=sObjectId;
                this._bindView("/QRCodeSet");
            },

            _onNavtoQRDeatilsPage: function (oItem) {
                var that = this;
                var sObjectPath = oItem.getBindingContext().sPath;
                that.getRouter().navTo("QRCodeDetailsPage", {
                    QRNo: oItem.getBindingContext().getObject().PackingListId
                });
            },

            _bindView: function (sObjectPath) {
                var objectViewModel = this.getViewModel("objectViewModel");
                this.getView().bindElement({
                    path: sObjectPath,
                    events: {
                        dataRequested: function () {
                            objectViewModel.setProperty("/busy", true);
                        },
                        dataReceived: function () {
                            objectViewModel.setProperty("/busy", false);
                        }
                    }
                });
            },

            onQRCodeSuggestionSelected: function (oEvent) {
                var qrcodeID = this.byId("idInputQRCode").getValue();
                var that = this;
                if (qrcodeID !== "") {
                    that.getView().byId("idQRBtn").setProperty("enabled", true);
                } else {
                    that.getView().byId("idQRBtn").setProperty("enabled", false);
                }
            },

            onInvoiceSuggestionSelected: function (oEvent) {
                var invoiceID = this.byId("idInvoiceNum").getValue();
                var that = this;
                if (invoiceID !== "") {
                    that.getView().byId("idInvBtn").setProperty("enabled", true);
                    that.getView().byId("idInputQRCode").setProperty("enabled", false);

                } else {
                    that.getView().byId("idInvBtn").setProperty("enabled", false);
                    that.getView().byId("idInputQRCode").setProperty("enabled", true);
                }
            },

            //scannner related functions
            onScanSuccess: function (oEvent) {
                //debugger;
                if (oEvent.getParameter("cancelled")) {
                    sap.m.MessageToast.show("Scan cancelled", { duration: 1000 });
                } else {
                    var sScannedValue = oEvent.getParameter("text");
                    if (sScannedValue.length > 0) {
                        var isValid = this.checkForValidJSON(sScannedValue);
                        if (isValid) {
                            sap.m.MessageToast.show("Successfully scanned: " + JSON.parse(JSON.parse(sScannedValue)).QRNumber);
                            this.validateQRCode(JSON.parse(JSON.parse(sScannedValue)).QRNumber);
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

            // On Submit QR Histroy
            onPressSubmitQRCode: function () {
                this.validateQRCode();
            },

            // Validate QR Code
            validateQRCode: function (QRCode) {
                this.getViewModel("objectViewModel").setProperty("/busy", true);
                var qrCodeId = this.getView().byId("idInputQRCode").getValue() || QRCode;
                var QRCodeFilter = new sap.ui.model.Filter({
                    path: "QRNumber",
                    operator: sap.ui.model.FilterOperator.EQ,
                    value1: qrCodeId
                });
                var filter = [];
                filter.push(QRCodeFilter);
                this.getComponentModel().read("/QRCodeSet", {
                    filters: [filter],
                    urlParameters: {
                        "$expand": "PackingList"
                    },
                    success: function (oData) {
                        this.getViewModel("objectViewModel").setProperty("/busy", false);

                        if (oData.results.length !== 0) {
                            this.oRouter.navTo("QRCodeDetailsPage", {
                                PackingID: oData.results[0].PackingList.ID
                                //     PackingID: 71
                            }, false);
                        }
                        else {
                            sap.m.MessageBox.error("Invalid QR Code");
                        }
                    }.bind(this),
                    error: function (oError) {
                        this.getViewModel("objectViewModel").setProperty("/busy", false);
                        //sap.m.MessageBox.error(JSON.stringify(oError));
                    }.bind(this),
                });
            },

            onPressSubmitInvoiceNumber: function () {
                this.validateInvoiceNumber();
            }
        });
    });
