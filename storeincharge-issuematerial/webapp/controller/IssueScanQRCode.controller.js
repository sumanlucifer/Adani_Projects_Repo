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
                doneButton: true,
                reserveButton: true
            });
            this.setModel(oViewModel, "objectViewModel");

            //    this._initializeCreationModels();

            // Keeps reference to any of the created sap.m.ViewSettingsDialog-s in this sample
            this._mViewSettingsDialogs = {};

            //Router Object
            this.oRouter = this.getRouter();
            this.oRouter.getRoute("RaiseIssueScanQRCode").attachPatternMatched(this._onObjectMatched, this);
        },

        _onObjectMatched: function (oEvent) {
            var sObjectId = oEvent.getParameter("arguments").SOId;
            this._bindView("/SONumberDetailsSet(" + sObjectId + ")");
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
                    }
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

        // On Submit QR Histroy
        onPressSubmitQRCode: function () {
            var that = this;
            this.validateQRCode();
        },

        // Validate QR Code
        validateQRCode: function () {
            var that = this;
            var qrCodeId = this.getView().byId("idInputQRCode").getValue();
            var QRNumberFilter = new sap.ui.model.Filter({
                path: "QRNumber",
                operator: sap.ui.model.FilterOperator.EQ,
                value1: qrCodeId
            });

            var PACKINGLISTFilter = new sap.ui.model.Filter({
                path: "Type",
                operator: sap.ui.model.FilterOperator.EQ,
                value1: 'INNER'
            });
            var filter = [];
            filter.push(QRNumberFilter);
            filter.push(PACKINGLISTFilter);
            var sPath = "/QRCodeSet?$filter=QRNumber eq '" + qrCodeId + "' and Type eq 'INNER'&$expand=PackingList"

            this.MainModel.read("/QRCodeSet", {
                urlParameters: {
                    "$expand": "PackingList"
                },
                filters: [filter],
                success: function (oData, oResponse) {
                    if (oData) {
                        if (oData.results.length) {
                            sap.m.MessageBox.success("QR Code is valid");
                            // that.oRouter.navTo("RouteDetailsPage", {
                            //     RequestId: oData.results[0].PackingList.ID,
                            //     Type: "QR"
                            // }, false);
                        } else {
                            sap.m.MessageBox.error("Please Enter Valid Packing List QR Code");
                        }
                    } else {
                        sap.m.MessageBox.error("Please Enter Valid Packing List QR Code");
                    }
                }.bind(this),
                error: function (oError) {
                    sap.m.MessageBox.error(JSON.stringify(oError));
                }
            });
        },

    });
});