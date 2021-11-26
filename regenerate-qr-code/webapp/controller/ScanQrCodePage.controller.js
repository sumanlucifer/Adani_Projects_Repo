sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageBox",
    "sap/m/MessageToast"
],
	/**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (BaseController, JSONModel, Filter, FilterOperator, MessageBox, MessageToast) {
        "use strict";

        return BaseController.extend("com.agel.mmts.regenerateqrcode.controller.ScanQrCodePage", {

            onInit: function () {
                var oViewModel = new JSONModel({
                    "submitQRCode": false,
                    "scanQRCode": true,
                    "submitInvoiceCode": false,
                    "inputQRCode": true,
                    "busy": false

                });
                this.setModel(oViewModel, "objectViewModel");
            },

            _onNavtoQRDeatilsPage: function (oItem) {
                var sObjectPath = oItem.getBindingContext().sPath;
                that.getRouter().navTo("QRCodeDetailsPage", {
                    QRNo: oItem.getBindingContext().getObject().PackingListId
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

            // On Press QR Histroy
            onPressScanQRCode: function () {
                this.getView().byId("idQRBtn").setProperty("enabled", false);
                this.getView().byId("idInvBtn").setProperty("enabled", false);
                this.getView().byId("idInputQRCode").setProperty("enabled", false);
                this.getView().byId("idInvoiceNum").setProperty("enabled", false);
                this.openScanner();
            },

            openScanner: function () {
                if (!this._oScannerDialog) {
                    this._oScannerDialog = sap.ui.xmlfragment("com.agel.mmts.securityscanqr.view.fragments.common.Scanner", this);
                    this.getView().addDependent(this._oScannerDialog);
                }
                this._oScannerDialog.open();
            },

            onCloseSgnnerDialog: function (oEvent) {
                this._oScannerDialog.close();
            },

            onQRCodeScanned: function (oEvent) {
                var sScannedValue = oEvent.getSource().getValue();
                if (sScannedValue.length > 0) {
                    var isValid = this.checkForValidJSON(sScannedValue);
                    if (isValid) {
                        MessageToast.show(JSON.parse(JSON.parse(sScannedValue)).QRNumber);
                        this.validateQRCode(JSON.parse(JSON.parse(sScannedValue)).QRNumber);
                        this.onCloseSgnnerDialog();
                    } else {
                        MessageBox.error(this.getResourceBundle().getText("MSGInvalidQRCode"));
                    }
                }
                oEvent.getSource().scanner._camera.stop();
            },

            //scannner related functions
            onScanSuccess: function (oEvent) {
                debugger;
                if (oEvent.getParameter("cancelled")) {
                    MessageToast.show("Scan cancelled", { duration: 1000 });
                } else {
                    MessageToast.show("Scanned: " + oEvent.getParameter("text"), { duration: 2000 });
                    var sScannedValue = oEvent.getParameter("text");
                    if (sScannedValue.length > 0) {
                        var isValid = this.checkForValidJSON(sScannedValue);
                        if (isValid) {
                            MessageToast.show(JSON.parse(JSON.parse(sScannedValue)).QRNumber);
                            this.validateQRCode(JSON.parse(JSON.parse(sScannedValue)).QRNumber);
                        } else {
                            MessageBox.error(this.getResourceBundle().getText("MSGInvalidQRCode"));
                        }
                    }
                }
            },

            onScanError: function (oEvent) {
                MessageToast.show("Scan failed" + oEvent, { duration: 1000 });
            },

            onScanLiveupdate: function (oEvent) {
                var sCloseCode = oModel.getProperty("/closeCode");
                if (sCloseCode && sCloseCode === oEvent.getParameter("newValue")) {
                    sap.ndc.BarcodeScanner.closeScanDialog();
                }
            },

            checkForValidJSON: function (sScannedValue) {
                try {
                    return (JSON.parse(JSON.parse(sScannedValue)) && !!sScannedValue);
                } catch (e) {
                    return false;
                }
            },


            // Read QR Code details and Validate QR Code, If valid navigate to details page
            onPressSubmitQRCode: function (QRCode) {
                this.getViewModel("objectViewModel").setProperty(
                    "/busy",
                    true
                );
                var sQRCode = this.getView().byId("idInputQRCode").getValue(),
                    QRCodeFilter = new Filter("QRNumber", FilterOperator.EQ, sQRCode);
                this.getComponentModel().read("/QRCodeSet", {
                    filters: [QRCodeFilter],
                    urlParameters: {
                        "$expand": "PackingListParentItem"
                    },
                    success: function (oData) {
                        this.getViewModel("objectViewModel").setProperty(
                            "/busy",
                            false
                        );
                        if (oData.results.length > 0) {
                            if (oData.results[0].Type !== "PARENT") {
                                MessageBox.error(this.getResourceBundle().getText("MSGUseParentQRCode"));
                            } else {
                                this.getRouter().navTo("QRCodeDetailsPage", {
                                    QRNumber: oData.results[0].QRNumber
                                });
                            }
                        }
                        else {
                            MessageBox.error(this.getResourceBundle().getText("MSGInvalidQRCode"));
                        }
                    }.bind(this),
                    error: function (oError) {
                        this.getViewModel("objectViewModel").setProperty(
                            "/busy",
                            false
                        );
                        // MessageBox.error(JSON.stringify(oError));
                    }.bind(this),
                });
            }
        });
    });
