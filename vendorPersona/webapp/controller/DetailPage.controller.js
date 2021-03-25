sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/Fragment",
    "sap/ui/model/Sorter",
    "sap/ui/Device"
], function (BaseController, JSONModel, Filter, FilterOperator, Fragment, Sorter, Device) {
    "use strict";

    return BaseController.extend("com.agel.mmts.vendorPersona.controller.DetailPage", {

        onInit: function () {
            //view model instatiation
            var oViewModel = new JSONModel({
                busy: true,
                delay: 0
            });
            this.setModel(oViewModel, "objectViewModel");

            // keeps the search state
            this._aTableSearchState = [];
            // Keeps reference to any of the created dialogs
            this._mViewSettingsDialogs = {};

            //Router Object
            this.oRouter = this.getRouter();
            this.oRouter.getRoute("RouteDetailPage").attachPatternMatched(this._onObjectMatched, this);
        },

        _onObjectMatched: function (oEvent) {
            var sObjectId = oEvent.getParameter("arguments").vendorId;
            this._bindView("/Vendors" + sObjectId);
        },

        _bindView: function (sObjectPath) {
            var objectViewModel = this.getViewModel("objectViewModel");

            this.getView().bindElement({
                path: sObjectPath,
                parameters: {
                    "$expand": "purchase_orders"
                },
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

        onPurchaseOrderTableUpdateFinished: function (oEvent) {
            //Setting the header context for a property binding to $count
            var oView = this.getView(),
                oTableBinding = oView.byId("idPurchaseOrdersTable").getBinding("items");

            if (oTableBinding.getHeaderContext())
                oView.byId("tableHeader").setBindingContext(oTableBinding.getHeaderContext());
        },

        _getViewSettingsDialog: function (sDialogFragmentName) {
            var pDialog = this._mViewSettingsDialogs[sDialogFragmentName];

            if (!pDialog) {
                pDialog = Fragment.load({
                    id: this.getView().getId(),
                    name: sDialogFragmentName,
                    controller: this
                }).then(function (oDialog) {
                    if (Device.system.desktop) {
                        oDialog.addStyleClass("sapUiSizeCompact");
                    }
                    return oDialog;
                });
                this._mViewSettingsDialogs[sDialogFragmentName] = pDialog;
            }
            return pDialog;
        },

        handleSortButtonPressed: function () {
            this._getViewSettingsDialog("com.agel.mmts.vendorPersona.view.fragments.detailPage.SortDialog")
                .then(function (oViewSettingsDialog) {
                    oViewSettingsDialog.open();
                });
        },

        handleFilterButtonPressed: function (oEvent) {
            this._getViewSettingsDialog("com.agel.mmts.vendorPersona.view.fragments.detailPage.FilterDialog")
                .then(
                    function (oViewSettingsDialog) {
                        oViewSettingsDialog.setModel(this.getComponentModel());
                        oViewSettingsDialog.open();
                    }.bind(this)
                );
        },

        handleSortDialogConfirm: function (oEvent) {
            var oTable = this.byId("idPurchaseOrdersTable"),
                mParams = oEvent.getParameters(),
                oBinding = oTable.getBinding("items"),
                sPath,
                bDescending,
                aSorters = [];

            sPath = mParams.sortItem.getKey();
            bDescending = mParams.sortDescending;
            aSorters.push(new Sorter(sPath, bDescending));

            // apply the selected sort and group settings
            oBinding.sort(aSorters);
        },

        handleFilterDialogConfirm: function (oEvent) {
            var oTable = this.byId("idPurchaseOrdersTable"),
                mParams = oEvent.getParameters(),
                oBinding = oTable.getBinding("items"),
                aFilters = [];

            var sPath = Object.keys(mParams.filterCompoundKeys)[0],
                sOperator = "EQ",
                sValue1 = mParams.filterKeys.CONFIRMED ? 'CONFIRMED' : 'PENDING',
                oFilter = new Filter(sPath, sOperator, sValue1);

            aFilters.push(oFilter);

            // apply filter settings
            oBinding.filter(aFilters);

            // update filter bar
            this.byId("vsdFilterBar").setVisible(aFilters.length > 0);
            this.byId("vsdFilterLabel").setText(mParams.filterString);
        },

        //triggers on press of a vendor item from the list
        onPurchaseOrderPress: function (oEvent) {
            // The source is the list item that got pressed
            this._showObject(oEvent.getSource());
        },

        _showObject: function (oItem) {
            var that = this;
            oItem.getBindingContext().requestCanonicalPath().then(function (sObjectPath) {
                that.getRouter().navTo("RoutePODetailPage", {
                    POId: sObjectPath.slice("/PurchaseOrders".length) // /PurchaseOrders(123)->(123)
                });
            });
        },

        //when the breadcrum pressed
        handleToAllVendorsBreadcrumPress: function (oEvent) {
            this.getRouter().navTo("RouteLandingPage");
        },

        // Child Line Items Dialog Open
        handleChildItemsDialogOpen : function(oEvent){
            
            this._getViewSettingsDialog("com.agel.mmts.vendorPersona.view.fragments.detailPage.ChildItemsDialog")
                .then(
                    function (oViewDialog) {
                        oViewDialog.setModel(this.getComponentModel());
                        oViewDialog.open();
                    }.bind(this)
                );
        }
    });
});
