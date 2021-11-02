sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/Fragment",
    "sap/ui/model/Sorter",
    "sap/ui/Device",
    'sap/m/MessageToast',
    "sap/m/MessageBox",
    'sap/ui/core/ValueState'
],
    function (BaseController, JSONModel, Filter, FilterOperator, Fragment, Sorter, Device, MessageToast, MessageBox, ValueState) {
        "use strict";
        return BaseController.extend("com.agel.mmts.raiseconsumptionporequest.controller.RaiseConsumptionPage", {
            onInit: function () {
                //Router Object
                this.oRouter = this.getRouter();
                //view model instatiation
                var oViewModel = new JSONModel({
                    busy: false,
                    delay: 0
                });
                this.setModel(oViewModel, "objectViewModel");
                // Main Model Set
                this.MainModel = this.getComponentModel();
                this.getView().setModel(this.MainModel);
            },
            _onObjectMatched: function (oEvent) {
            },
            // on Go Search 
            onSearch: function () {
                var that = this;
                this.validateSONumber();
            },
            onbeforeRebindIssueReservedTable: function (oEvent) {
                var mBindingParams = oEvent.getParameter("bindingParams");
                mBindingParams.sorter.push(new sap.ui.model.Sorter("ReservationDate", true));
            },
            onbeforeRebindConsumptionTable: function (oEvent) {
                var mBindingParams = oEvent.getParameter("bindingParams");
                mBindingParams.sorter.push(new sap.ui.model.Sorter("DocumentDate", true));
            },
            onDetailPress: function (oEvent) {
                var that = this;
                var sObjectPath = oEvent.getSource().getBindingContext().getObject().ID;
                this.oRouter.navTo("RouteReturnConsumptionDetailPage", {
                 ReservationID: sObjectPath
                                //  ReservationID: 12
                }, false);
            },
            onNavigationCancelPress: function (oEvent) {
                var that = this;
                var sObjectPath = oEvent.getSource().getBindingContext().getObject().ID;
                this.oRouter.navTo("RouteReturnConsumptionCancelPage", {
                    PostingID: sObjectPath
                }, false);
            }
        });
    });
