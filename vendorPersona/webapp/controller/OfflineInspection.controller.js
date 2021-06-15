sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/Fragment",
    "sap/ui/model/Sorter",
    "sap/ui/Device",
    'sap/ui/core/ValueState',
    '../utils/formatter',
], function (BaseController, JSONModel, Filter, FilterOperator, Fragment, Sorter, Device, ValueState, formatter) {
    "use strict";

    return BaseController.extend("com.agel.mmts.vendorPersona.controller.OfflineInspection", {
        formatter: formatter,

        onInit: function () {
            //Router Object
            this.oRouter = this.getRouter();
            this.oRouter.getRoute("RouteCreateOfflineInspection").attachPatternMatched(this._onObjectMatched, this);

            //view model instatiation
            var oViewModel = new JSONModel({
                busy: false,
                delay: 0,
                bQunatityInput: false
            });
            this.setModel(oViewModel, "objectViewModel");
        },

        _onObjectMatched: function (oEvent) {
            var sObjectId = oEvent.getParameter("arguments").POId;
            this._bindView("/PurchaseOrderSet(" + sObjectId + ")");
            this._getLineItemData("/PurchaseOrderSet(" + sObjectId + ")/ParentLineItems");
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

        _getLineItemData: function (sPath) {
            this.getComponentModel().read(sPath, {
                success: function (oData, oResponse) {
                    var data = oData.results;
                    this._prepareDataForView(data);
                }.bind(this),
                error: function (oError) {
                    sap.m.MessageBox.error(JSON.stringify(oError));
                }
            })
        },

        _prepareDataForView: function(data){
            if(data.length){
                data.forEach(element => {
                    element.inspectionQuantity= null;
                });
            }
            var oModel = new JSONModel(data);
            this.getView().byId("idParentItemTable").setModel(oModel, "ParentItemModel");
        },

        onSelectionChange: function (oEvent) {
            var bSelected = oEvent.getParameter("selected");
            var bSelectAll = oEvent.getParameter("selectAll");
            var aListItems = oEvent.getParameter("listItems");

            if (bSelectAll) {
                for (var i = 0; i < aListItems.length; i++) {
                    aListItems[i].getCells()[4].setEnabled(true);
                }
            } else {
                for (var i = 0; i < aListItems.length; i++) {
                    aListItems[i].getCells()[4].setEnabled(false);
                }
            }

            if (bSelected) {
                oEvent.getParameter("listItem").getCells()[4].setEnabled(true);
            } else {
                oEvent.getParameter("listItem").getCells()[4].setEnabled(false);
            }
        },

        onSaveButtonPress: function (oEvent) {
            //debugger;
            var aTableData = this.byId("idParentItemTable").getModel("ParentItemModel").getData();
            var aSelectedItemsFromTable = aTableData.filter(item => item.inspectionQuantity !== null);
        }


    });
});
