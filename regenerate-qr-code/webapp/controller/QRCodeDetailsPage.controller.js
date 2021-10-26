sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/m/PDFViewer",
    "sap/ui/Device"
],
	/**
	 * @param {typeof sap.ui.core.mvc.Controller} Controller
	 */
    function (BaseController, JSONModel, Filter, FilterOperator, MessageBox, MessageToast, PDFViewer, Device) {
        "use strict";

        return BaseController.extend("com.agel.mmts.regenerateqrcode.controller.QRCodeDetailsPage", {
            onInit: function () {
                jQuery.sap.addUrlWhitelist("blob");
                var oViewModel = new JSONModel({
                    busy: false,
                    delay: 0
                });
                this.getView().setModel(oViewModel, "objectViewModel");

                //Router Object
                this.oRouter = this.getOwnerComponent().getRouter();
                this.oRouter.getRoute("QRCodeDetailsPage").attachPatternMatched(this._onObjectMatched, this);
            },

            _onObjectMatched: function (oEvent) {
                this.sQRNumber = oEvent.getParameter("arguments").QRNumber;
                this.fnGetQRCodeDetails();
            },

            fnGetQRCodeDetails: function () {
                this.getView().setBusy(true);
                this.getView().byId("idSaveQtyBTN").setEnabled(false);
                this.getView().byId("idNewUpdatedQtyINP").setValueState("None");

                var oQRCodeFilter = new Filter("QRNumber", FilterOperator.EQ, this.sQRNumber);
                this.getView().getModel().read("/QRCodeSet", {
                    filters: [oQRCodeFilter],
                    urlParameters: {
                        "$expand": "PackingListParentItem,RegenerateQRCode"
                    },
                    success: function (oData) {
                        this.getView().setBusy(false);
                        if (oData.results.length > 0) {
                            var oQRDetailModel = new JSONModel(oData.results[0]);
                            this.getView().setModel(oQRDetailModel, "QRDetailModel");
                        }
                        else {
                            MessageBox.error(this.getResourceBundle().getText("MSGNoQRCodeDetailsFound"));
                        }
                    }.bind(this),
                    error: function (oError) {
                        this.getView().setBusy(false);
                        MessageBox.error(JSON.stringify(oError));
                    }.bind(this),
                });
            },

            onRegeneratedQRTBLRendered: function () {
                var aRegeneratedQRCodes = this.getView().byId("idRegeneratedQRCodesTBL").getItems();

                if (aRegeneratedQRCodes.length > 0) {
                    var sLastUpdatedQty = aRegeneratedQRCodes[0].getBindingContext("QRDetailModel").getObject().UpdatedQty;
                    this.getView().getModel("QRDetailModel").setProperty("/AvailableQty", sLastUpdatedQty);
                } else {
                    var sAvailableQty = this.getView().getModel("QRDetailModel").getProperty("/PackingListParentItem/DispatchQty");
                    this.getView().getModel("QRDetailModel").setProperty("/AvailableQty", sAvailableQty);
                }
            },

            fnEnterQtyValidations: function (oEvent) {
                var fNewQty = parseFloat(oEvent.getSource().getValue()),
                    fDispatchQty = parseFloat(this.getView().getModel("QRDetailModel").getProperty("/PackingListParentItem/DispatchQty")),
                    fAvailableQty = parseFloat(this.getView().getModel("QRDetailModel").getProperty("/AvailableQty"));

                if (fNewQty > fDispatchQty || fNewQty <= 0 || fNewQty > fAvailableQty) {
                    oEvent.getSource().setValueState("Error");
                    oEvent.getSource().setValueStateText(this.getResourceBundle().getText("PleaseEnterValidQty"));
                    this.getView().byId("idSaveQtyBTN").setEnabled(false);
                } else {
                    oEvent.getSource().setValueState("None");
                    this.getView().byId("idSaveQtyBTN").setEnabled(true);
                }
            },

            onSavePress: function () {
                this.getView().setBusy(true);
                var sQRCode = this.getView().getModel("QRDetailModel").getProperty("/QRNumber"),
                    fUpdatedQty = parseFloat(this.getView().getModel("QRDetailModel").getProperty("/UpdatedQty")),
                    oPayload = {
                        "QRNumber": sQRCode,
                        "UpdatedQty": fUpdatedQty
                    };

                this.getView().getModel().create("/RegeneratedQRCodeEdmSet", oPayload, {
                    success: function (oData) {
                        this.getView().setBusy(false);
                        MessageBox.success(this.getResourceBundle().getText("QRCodeRegeneratedWithUpdatedQty"));
                        this.fnGetQRCodeDetails();
                    }.bind(this),
                    error: function (oError) {
                        this.getView().setBusy(false);
                        MessageBox.error(JSON.stringify(oError));
                    }
                });
            },

            onViewQRCodePress: function (oEvent) {
                this.getView().setBusy(true);
                var sQRNumber = this.getView().getModel("QRDetailModel").getProperty("/QRNumber"),
                    sRegeneratedQRId = parseInt(oEvent.getSource().getParent().getBindingContext("QRDetailModel").getObject().ID),
                    aQRPayload = {
                        "QRNumber": sQRNumber,
                        "RegeneratedQRId": sRegeneratedQRId
                    };
                this.getView().getModel().create("/QuickAccessQRCodeEdmSet", aQRPayload, {
                    success: function (oData) {
                        this.getView().setBusy(false);
                        if (oData.Success) {
                            MessageToast.show(oData.Message);
                            this.fnShowQRDetailsInPDFViewer(oData.Base64String);
                        }
                        else {
                            MessageBox.error(this.getResourceBundle().getText("MSGNoQRCodeDetailsFound"));
                        }
                        this.getView().getModel().refresh();
                    }.bind(this),
                    error: function (oError) {
                        this.getView().setBusy(false);
                        MessageBox.success(JSON.stringify(oError));
                    }
                })
            },

            fnShowQRDetailsInPDFViewer: function (base64Data) {
                var oPDFViewer = new PDFViewer(),
                    decodedPdfContent = atob(base64Data),
                    byteArray = new Uint8Array(decodedPdfContent.length)

                this.getView().addDependent(oPDFViewer);

                for (var i = 0; i < decodedPdfContent.length; i++) {
                    byteArray[i] = decodedPdfContent.charCodeAt(i);
                }
                var blob = new Blob([byteArray.buffer], { type: 'application/pdf' }),
                    _pdfurl = URL.createObjectURL(blob);

                oPDFViewer.setSource(_pdfurl);
                if (Device.system.desktop) {
                    oPDFViewer.addStyleClass("sapUiSizeCompact");
                }

                oPDFViewer.setTitle("QR Code");
                oPDFViewer.setShowDownloadButton(false);
                oPDFViewer.open();
            }
        });
    });
