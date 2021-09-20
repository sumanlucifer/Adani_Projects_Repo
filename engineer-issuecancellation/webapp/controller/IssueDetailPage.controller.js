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
    return BaseController.extend("com.agel.mmts.engineerissuecancellation.controller.IssueDetailPage", {
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
            this.oRouter.getRoute("IssueDetailPage").attachPatternMatched(this._onObjectMatched, this);
        },
        _onObjectMatched: function (oEvent) {
            var sObjectId = oEvent.getParameter("arguments").ID;
            this.sObjectId = sObjectId;
            this._bindView("/IssuedMaterialSet(" + sObjectId + ")");
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
        handleToAllPOBreadcrumPress: function (oEvent) {
            history.go(-1);
        },
        onPressCancelIssuePosting: function (oEvent) {
            var that = this;
            var ConsumptionPostingReserveId = that.sObjectId;
            var ConsumptionPostingId = oEvent.getSource().getBindingContext().getObject().ConsumptionPostingId;
            MessageBox.confirm("Do you want to Cancel the issue posting?", {
                icon: MessageBox.Icon.INFORMATION,
                title: "Confirm",
                actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                emphasizedAction: MessageBox.Action.YES,
                onClose: function (oAction) {
                    if (oAction == "YES") {
                        that.onSubmitCancelConfirmPress(ConsumptionPostingReserveId);
                    }
                }
            });
        },

        onSubmitCancelConfirmPress: function (oEvent) {


            var oPayload = {
                "IssuedMaterialId": this.sObjectId,
                "UserName": "Test"
            };


            this.getOwnerComponent().getModel().create("/CancelIssuedMaterialEdmSet", oPayload, {
                success: function (oData, oResponse) {
                    if (oData.Success === true) {

                        sap.m.MessageBox.success("The issue posting has been successfully cancelled for selected Items!");
                    }
                    else {
                        sap.m.MessageBox.error(oData.Message);
                    }



                }.bind(this),
                error: function (oError) {
                    debugger;
                    sap.m.MessageBox.error("Data Not Found");
                }
            });
        }
    });
});