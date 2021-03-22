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

    return BaseController.extend("com.agel.mmts.vendorPersona.controller.LandingPage", {
        onInit: function () {
            //Initialize the global Router Object
            this.oRouter = this.getRouter();
            this.oRouter.getRoute("RouteLandingPage").attachPatternMatched(this._onObjectMatched, this);

            // variable instatiation
            var oViewModel,
                iOriginalBusyDelay,
                oTable = this.byId("idVendorTable");

            // Put down worklist table's original value for busy indicator delay, so it can be restored later on. Busy handling on the table is taken care of by the table itself.
            iOriginalBusyDelay = oTable.getBusyIndicatorDelay();

            // keeps the search state
            this._aTableSearchState = [];
            // Keeps reference to any of the created dialogs
            this._mViewSettingsDialogs = {};

            // Model used to manipulate control states
            oViewModel = new JSONModel({
                worklistTableTitle: this.getResourceBundle().getText("worklistTableTitle"),
                tableNoDataText: this.getResourceBundle().getText("tableNoDataText"),
                tableBusyDelay: 0
            });
            this.setModel(oViewModel, "worklistView");

            // Make sure, busy indication is showing immediately so there is no break after the busy indication for loading the view's meta data is ended (see promise 'oWhenMetadataIsLoaded' in AppController)
            oTable.attachEventOnce("updateFinished", function () {
                // Restore original busy indicator delay for worklist's table
                oViewModel.setProperty("/tableBusyDelay", iOriginalBusyDelay);
            });
        },

        _onObjectMatched: function (oEvent) { },

        //triggers when the updating vendor table finishes
        onUpdateFinished: function (oEvent) {

            //Setting the header context for a property binding to $count
            var oView = this.getView(),
                oTableBinding = oView.byId("idVendorTable").getBinding("items");

            if (oTableBinding.getHeaderContext())
                oView.byId("tableHeader").setBindingContext(oTableBinding.getHeaderContext());
        },

        onSearch: function (oEvent) {
            if (oEvent.getParameters().refreshButtonPressed) {
                this._onRefresh();
            } else {
                var aTableSearchState = [];
                var sQuery = oEvent.getParameter("query");
                sQuery =sQuery[0].toUpperCase() + sQuery.substr(1).toLowerCase();
                if (sQuery && sQuery.length > 0) {
                    aTableSearchState = [new Filter("name", FilterOperator.Contains, sQuery)];
                }
                this._applySearch(aTableSearchState);
            }
        },

        _applySearch: function (aTableSearchState) {
            var oTable = this.byId("idVendorTable"),
                oViewModel = this.getViewModel("worklistView");

            oTable.getBinding("items").filter(aTableSearchState, "Application");

            // changes the noDataText of the list in case there are no filter results
            if (aTableSearchState.length !== 0) {
                oViewModel.setProperty("/tableNoDataText", this.getResourceBundle().getText("worklistNoDataWithSearchText"));
            }
        },

        _onRefresh: function () {
            var oTable = this.byId("idVendorTable");
            oTable.getBinding("items").refresh();
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
            this._getViewSettingsDialog("com.agel.mmts.vendorPersona.view.fragments.landingPage.SortDialog")
                .then(function (oViewSettingsDialog) {
                    oViewSettingsDialog.open();
                });
        },

        handleFilterButtonPressed: function (oEvent) {
            this._getViewSettingsDialog("com.agel.mmts.vendorPersona.view.fragments.landingPage.FilterDialog")
                .then(
                    function (oViewSettingsDialog) {
                        oViewSettingsDialog.setModel(this.getComponentModel());
                        oViewSettingsDialog.open();
                    }.bind(this)
                );
        },

        handleSortDialogConfirm: function (oEvent) {
            var oTable = this.byId("idVendorTable"),
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
            var oTable = this.byId("idVendorTable"),
                mParams = oEvent.getParameters(),
                oBinding = oTable.getBinding("items"),
                aFilters = [];

            mParams.filterItems.forEach(function (oItem) {
                var sPath = oItem.getKey(),
                    sOperator = "EQ",
                    sValue1 = oItem.getText(),
                    oFilter = new Filter(sPath, sOperator, sValue1);
                aFilters.push(oFilter);
            });

            // apply filter settings
            oBinding.filter(aFilters);

            // update filter bar
            this.byId("vsdFilterBar").setVisible(aFilters.length > 0);
            this.byId("vsdFilterLabel").setText(mParams.filterString);
        },

        //triggers on press of a vendor item from the list
        onVendorItemPress: function (oEvent) {
            // The source is the list item that got pressed
            this._showObject(oEvent.getSource());
        },

        _showObject: function (oItem) {
            var that = this;

            oItem.getBindingContext().requestCanonicalPath().then(function (sObjectPath) {
                that.getRouter().navTo("RouteDetailPage", {
                    vendorId: sObjectPath.slice("/Vendors".length) // /Vendors(123)->(123)
                });
            });
        }
    });
});
