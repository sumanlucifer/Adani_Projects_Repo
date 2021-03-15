sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/Fragment",
    "sap/ui/model/Sorter",
    "sap/ui/Device",
    "sap/ui/core/routing/History"
], function (BaseController, JSONModel, Filter, FilterOperator, Fragment, Sorter, Device, History) {
    "use strict";

    return BaseController.extend("com.agel.mmts.vendorPersona.controller.PODetails", {
        onInit: function () {
            //view model instatiation
            var oViewModel = new JSONModel({
                busy: true,
                delay: 0
            });
            this.setModel(oViewModel, "objectViewModel");

            //Router Object
            this.oRouter = this.getRouter();
            this.oRouter.getRoute("RoutePODetailPage").attachPatternMatched(this._onObjectMatched, this);
        },

        _onObjectMatched: function (oEvent) {
            var sObjectId = oEvent.getParameter("arguments").POId;
            this._bindView("/PurchaseOrders" + sObjectId);
            this.getView().byId("idChildItemsTableSubsection").setVisible(false);
        },

        _bindView: function (sObjectPath) {
            var objectViewModel = this.getViewModel("objectViewModel");
            var that = this;

            this.getView().bindElement({
                path: sObjectPath,
                parameters: {
                    "$expand": {
                        "parent_line_items": {
                            "$expand": {
                                "child_line_items": {}
                            }
                        }
                    }
                },
                events: {
                    dataRequested: function () {
                        objectViewModel.setProperty("/busy", true);
                    },
                    dataReceived: function () {
                        objectViewModel.setProperty("/busy", false);
                        var oView = that.getView();
                    }
                }
            });
        },

        //when the breadcrum pressed
        handleToAllVendorsBreadcrumPress: function (oEvent) {
            this.getRouter().navTo("RouteLandingPage");
        },

        handleToAllPOBreadcrumPress: function (oEvent) {
            history.go(-1);
        },

        onParentItemsTableUpdateFinished: function (oEvent) {
            oEvent.getSource().removeSelections();
        },

        onParentItemSelect: function (oEvent) {
            var oContext = oEvent.getParameters().listItem.getBindingContext();
            var sPath = "parent_line_items(" + oContext.getObject().ID + ")";
            console.log({ sPath });
            var newPath = oEvent.getParameters().listItem.getBindingContextPath();
            console.log({ newPath });
            /* this.byId("idChildItemsTable").bindElement({
                path: sPath
            }); */
            /* this.byId("idChildItemsTable").bindItems({
                path: sPath,
                template: this.byId("idTemplate")
            }); */

            var childTable = this.byId("idChildItemsTable"),
                binding = childTable.getBinding("items"),
                oFilter = new Filter("parent_line_item_ID", "EQ", oContext.getObject().ID);
            binding.filter(oFilter);
            
            this.getView().byId("idChildItemsTableSubsection").setVisible(true);
        },

        onChildTableUpdateStarted: function(oEvent){
            oEvent.getSource().setBusy(true);
        },

        onChildItemsTableUpdateFinished: function(oEvent){
            oEvent.getSource().setBusy(false);
        }

    });
});