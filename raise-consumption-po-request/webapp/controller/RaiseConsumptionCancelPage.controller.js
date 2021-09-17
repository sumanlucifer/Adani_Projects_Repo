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
    return BaseController.extend("com.agel.mmts.raiseconsumptionporequest.controller.RaiseConsumptionCancelPage", {
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
                csvFile: "file"
            });
            this.setModel(oViewModel, "objectViewModel");
            var oReservationData = new JSONModel({
                ReservationNumber: null,
                ReservationDate: null
            });
            this.setModel(oReservationData, "oReservationData");
            //    this._initializeCreationModels();
            // Keeps reference to any of the created sap.m.ViewSettingsDialog-s in this sample
            this._mViewSettingsDialogs = {};
            // get Owener Component Model
            // Main Model Set
            this.MainModel = this.getComponentModel();
            this.getView().setModel(this.MainModel);
            //Router Object
            this.oRouter = this.getRouter();
            this.oRouter.getRoute("RouteReturnConsumptionCancelPage").attachPatternMatched(this._onObjectMatched, this);
        },
        _onObjectMatched: function (oEvent) {
            var that = this;
            var sObjectId = oEvent.getParameter("arguments").PostingID;
            this.sObjectId = sObjectId;
            this._bindView("/ConsumptionPostingSet(" + sObjectId + ")");
        },
        _bindView: function (sObjectPath) {
            var objectViewModel = this.getViewModel("objectViewModel");
            var that = this;
            this.getView().bindElement({
                path: sObjectPath,
                events: {
                    change: this._onBindingChange.bind(that),
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
        handleToAllPOBreadcrumPress: function (oEvent) {
            history.go(-1);
        },
        onBeforeRebindTreeTable: function (oEvent) {
            var mBindingParams = oEvent.getParameter("bindingParams");
            mBindingParams.parameters["expand"] = "IssuedMaterialBOQ";
            mBindingParams.parameters["navigation"] = { "IssuedMaterialParentSet": "IssuedMaterialBOQ" };
            mBindingParams.filters.push(new sap.ui.model.Filter("SONumberId/ID", sap.ui.model.FilterOperator.EQ, this.sObjectId));
        },
        onBeforeRebindRestTable: function (oEvent) {
            var mBindingParams = oEvent.getParameter("bindingParams");
            mBindingParams.filters.push(new Filter("SONumberId/ID", sap.ui.model.FilterOperator.EQ, this.sObjectId));
            mBindingParams.sorter.push(new sap.ui.model.Sorter("CreatedAt", true));
        },
        onPressCancelConsumptionPosting: function (oEvent) {
            var that = this;
            var ConsumptionPostingReserveId = that.sObjectId;
            var ConsumptionPostingId = oEvent.getSource().getBindingContext().getObject().ConsumptionPostingId;
            MessageBox.confirm("Do you want to Submit the consumption request?", {
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

            var sConsumptionReservationContext = "/ConsumptionPostingSet(" + parseInt(this.sObjectId) + "l)/ConsumptionPostingReserve"
            var ConsumptionReserveId = this.getView().getModel().getData(sConsumptionReservationContext).ID;
            var oPayload = {
                "UserName": "Agel",
                "IsAllItemsCancelled": true,
                "ConsumptionPostingId": this.sObjectId,
            };


            this.MainModel.create("/CancelConsumptionPostingEdmSet", oPayload, {
                success: function (oData, oResponse) {
                    if (oData.Success === true) {

                        sap.m.MessageBox.success("The consumption posting has been cancelled for selected Items!");
                    }
                    else {

                        sap.m.MessageBox.error(oData.Message);
                    }

                    debugger;
                }.bind(this),
                error: function (oError) {
                    debugger;
                    sap.m.MessageBox.error("Data Not Found");
                }
            });
        }
    });
});