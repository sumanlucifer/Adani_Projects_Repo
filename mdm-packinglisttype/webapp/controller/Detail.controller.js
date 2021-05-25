sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/Fragment",
    "sap/ui/model/Sorter",
    "sap/ui/Device",
    "sap/ui/core/routing/History",
    'sap/m/MessageToast',
    "sap/m/MessageBox",
], function (BaseController, JSONModel, Filter, FilterOperator, Fragment, Sorter, Device, History, MessageToast, MessageBox) {
    "use strict";

    return BaseController.extend("com.agel.mmts.mdmpackinglisttype.controller.Detail", {

        onInit: function () {
            //view model instatiation
            var oViewModel = new JSONModel({
                busy: false,
                delay: 0
            });
            this.setModel(oViewModel, "objectViewModel");

            //Router Object
            this.oRouter = this.getRouter();
            this.oRouter.getRoute("detail").attachPatternMatched(this._onObjectMatched, this);

            this.mainModel = this.getComponentModel();
        },

        _onObjectMatched: function (oEvent) {
            this.sPackingListID = oEvent.getParameter("arguments").packingListType;
            var sLayout = oEvent.getParameter("arguments").layout;

            this.getView().getModel().setProperty("/busy", false);

            this.getView().getModel("layoutModel").setProperty("/layout", sLayout);
            this._bindView("/MasterPackagingTypeSet" + this.sPackingListID);
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
        }


    });
});            
