sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/Fragment",
    "sap/ui/model/Sorter",
    "sap/ui/Device",
    "sap/ui/core/routing/History",
    "sap/m/ColumnListItem",
    "sap/m/Input",
    "sap/ui/core/ValueState",
    "sap/m/PDFViewer"
],
	/**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (BaseController, JSONModel, Filter, FilterOperator, Fragment, Sorter, Device, History, ColumnListItem, Input, ValueState, PDFViewer) {
        "use strict";

        return BaseController.extend("com.agel.mmts.storeinchargescanqr.controller.ScanQrCode", {

            onInit: function () {
                jQuery.sap.addUrlWhitelist("blob");
                //view model instatiation
                var oViewModel = new JSONModel({
                    busy: true,
                    delay: 0
                });
                this.setModel(oViewModel, "objectViewModel");

                var oViewModel = new JSONModel({
                    "submitQRCode": true,
                    "scanQRCode": true,
                    "inputQRCode": true

                });
                this.setModel(oViewModel, "oViewModel");

                // Main Model Set
                this.MainModel = this.getComponentModel();
                this.getView().setModel(this.MainModel);

                //Router Object
                this.oRouter = this.getRouter();
                this.oRouter.getRoute("RouteLandingPage").attachPatternMatched(this._onObjectMatched, this);
            },

            _onObjectMatched: function (oEvent) {
                var that = this;
                // this._bindView("/QuickAccessQRCodeEdmSet");
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
                var qrcodeID = this.byId("idInputQRCode").getSelectedKey();
                if (qrcodeID !== "") {
                    this.getView().byId("idQRBtn").setProperty("enabled", true);
                    this.getView().byId("idQRSubmit").setProperty("enabled", false);

                } else {
                    this.getView().byId("idQRBtn").setProperty("enabled", false);
                    this.getView().byId("idQRSubmit").setProperty("enabled", true);
                }
            },

            onPressScanQRCode: function (oEvent) {
                var that = this;
                this.getView().byId("idQRBtn").setProperty("enabled", false);
                this.getView().byId("idInputQRCode").setProperty("enabled", false);
                this.onViewQRCodePress(oEvent);
            },

            onPressSubmitQRCode: function (oEvent) {
                var that = this;
                this.onViewQRCodePress(oEvent);
            },

            onViewQRCodePress: function (oEvent) {
                var qrcodeID = this.byId("idInputQRCode").getValue();
                var aPayload = {
                    "QRNumber": qrcodeID,
                    "RegeneratedQRId" : 0
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
            }

        });
    });
