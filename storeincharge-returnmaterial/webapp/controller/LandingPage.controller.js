sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/Fragment",
    "sap/ui/model/Sorter",
    "sap/ui/Device",
    'sap/ui/core/ValueState'
], function (BaseController, JSONModel, Filter, FilterOperator, Fragment, Sorter, Device, ValueState) {
    "use strict";

    return BaseController.extend("com.agel.mmts.storeinchargereturnmaterial.controller.LandingPage", {
        onInit: function () {
            //view model instatiation
            var oViewModel = new JSONModel({
                busy: false,
                delay: 0
            });
            this.setModel(oViewModel, "objectViewModel");

            // keeps the search state
            this._aTableSearchState = [];

            //adding searchfield association to filterbar and initialize the filter bar -> added in base controller
            this.initializeFilterBar();
        },

        onBeforeRebindReqTable: function (oSource) {
            var binding = oSource.getParameter("bindingParams");
            var oFilter = new sap.ui.model.Filter("Status", sap.ui.model.FilterOperator.EQ, "RESERVED FOR RETURN MATERIAL");
            binding.filters.push(oFilter);
        },

        onBeforeRebindRetTable: function (oSource) {
            var binding = oSource.getParameter("bindingParams");
            var oFilter1 = new sap.ui.model.Filter("Status", sap.ui.model.FilterOperator.EQ, "APPROVED");
            var oFilter2 = new sap.ui.model.Filter("Status", sap.ui.model.FilterOperator.EQ, "REJECTED");
            var oFilter3 = new sap.ui.model.Filter("Status", sap.ui.model.FilterOperator.EQ, "PARTIALLY APPROVED");
            binding.filters.push(oFilter1,oFilter2,oFilter3);
        },

        onReturnedMaterialSummarySelect: function (oEvent) {
            var ReturnId = oEvent.getSource().getBindingContextPath();
            // var SOId = this.getViewModel().getData(ReturnId+'/SONumberId').ID;
            ReturnId = ReturnId.match(/\((.*?)l/)[1];
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("Summary", {
                id: ReturnId
                // SOId: SOId
            })
        },

        onReturnMaterialSelect: function (oEvent) {
            var ReturnId = oEvent.getSource().getBindingContextPath();
            // var SOId = this.getViewModel().getData(ReturnId+'/SONumberId').ID;
            ReturnId = ReturnId.match(/\((.*?)l/)[1];
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("RouteDetailsPage", {
                ReturnId: ReturnId
                // SOId: SOId
            })
        },

        onSearch: function (oEvent) {
            var orFilters = [];
            var andFilters = [];

            var FreeTextSearch = this.byId("filterbar").getBasicSearchValue();
            if (FreeTextSearch) {
                orFilters.push(new Filter("ReservationNumber", FilterOperator.Contains, FreeTextSearch));
                // orFilters.push(new Filter("ParentLineItems/Name", FilterOperator.Contains, FreeTextSearch));
                andFilters.push(new Filter(orFilters, false));
            }

            var idReturnMaterialTableBinding = this.getView().byId("idReturnMaterialTable").getTable().getBinding("items");

            if (andFilters.length == 0) {
                andFilters.push(new Filter("ID", FilterOperator.NE, 0));
                idReturnMaterialTableBinding.filter(new Filter(andFilters, true));
            }

            if (andFilters.length > 0) {
                idReturnMaterialTableBinding.filter(new Filter(andFilters, true));
            }
            // oTableBinding.filter(mFilters);
        },

        onResetFilters: function () {
            this.oFilterBar._oBasicSearchField.setValue("");

            var idReturnMaterialTableBinding = this.getView().byId("idUnloadMaterialTable").getTable().getBinding("items");

            idReturnMaterialTableBinding.filter([]);
            this.oFilterBar.fireFilterChange();
        },

        onFilterChange: function (oEvent) {
            //   if (oEvent.getSource().getValue().length){
            this.oFilterBar.fireFilterChange(oEvent);
            //  }
        },

        onIconTabSelect: function (oEvent) {
            var sKey = oEvent.getParameter("key");

            if (sKey === "Reserved") {
                this.byId("pageTitle").setText(this.getResourceBundle().getText("ReservedRequests"));
            } else if (sKey === "Returned") {
                this.byId("pageTitle").setText(this.getResourceBundle().getText("ReturnedRequests"));
            }
        }

    });
});