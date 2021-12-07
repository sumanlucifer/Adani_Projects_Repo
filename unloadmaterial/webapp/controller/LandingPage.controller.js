sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    // "sap/ui/core/Fragment",
    "sap/ui/model/Sorter",
    // "sap/ui/Device",
    'sap/ui/core/ValueState',
    '../utils/formatter',
], function (BaseController, JSONModel, Filter, FilterOperator, Sorter, ValueState, formatter) {
    "use strict";

    return BaseController.extend("com.agel.mmts.unloadmaterial.controller.LandingPage", {
        formatter: formatter,

        onInit: function () {

            //view model instatiation
            var oViewModel = new JSONModel({
                busy: false,
                delay: 0
            });
            this.setModel(oViewModel, "objectViewModel");

            // keeps the search state
            this._aTableSearchState = [];
            // Keeps reference to any of the created dialogs
            this._mViewSettingsDialogs = {};

            //adding searchfield association to filterbar and initialize the filter bar -> added in base controller
            this.initializeFilterBar();
        },

        // Date Range Selection
        onDateRangeSelectionChange: function (oEvent) {
            var sFrom = oEvent.getParameter("from"),
                sTo = oEvent.getParameter("to"),
                bValid = oEvent.getParameter("valid"),
                oEventSource = oEvent.getSource(),
                oText = this.byId("TextEvent");

            if (bValid) {
                oEventSource.setValueState(ValueState.None);
            } else {
                oEventSource.setValueState(ValueState.Error);
            }
            this.oFilterBar.fireFilterChange(oEvent);
        },

        // on Go Search 
        onSearch: function (oEvent) {
            var DateRange = this.byId("dateRangeSelectionId");
            var DateRangeValue = this.byId("dateRangeSelectionId").getValue();
            var CompanyCode = this.byId("idCompanyCode").getValue();
            //  var CompanyCode = this.byId("idCompanyCode").getValue();
            var orFilters = [];
            var andFilters = [];

            var FreeTextSearch = this.byId("filterbar").getBasicSearchValue();
            if (FreeTextSearch) {
                orFilters.push(new Filter("PackingList/Name", FilterOperator.Contains, FreeTextSearch));
                orFilters.push(new Filter("VendorCode", FilterOperator.EQ, FreeTextSearch));
                // orFilters.push(new Filter("ParentLineItems/Name", FilterOperator.Contains, FreeTextSearch));
                andFilters.push(new Filter(orFilters, false));
            }

            if (DateRangeValue != "") {
                var From = new Date(DateRange.getFrom());
                var To = new Date(DateRange.getTo());
                andFilters.push(new Filter("UnloadedDate", FilterOperator.BT, From.toISOString(), To.toISOString()));
            }

            if (CompanyCode != "") {
                andFilters.push(new Filter("VendorCode", FilterOperator.EQ, CompanyCode));
            }

            var idUnloadMaterialTableBinding = this.getView().byId("idUnloadMaterialTable").getTable().getBinding("items");

            if (andFilters.length == 0) {
                andFilters.push(new Filter("ID", FilterOperator.NE, 0));
                idUnloadMaterialTableBinding.filter(new Filter(andFilters, true));
            }

            if (andFilters.length > 0) {
                idUnloadMaterialTableBinding.filter(new Filter(andFilters, true));
            }
            // oTableBinding.filter(mFilters);
        },

        onResetFilters: function () {
            this.oFilterBar._oBasicSearchField.setValue("");
            this.byId("dateRangeSelectionId").setValue("");
            this.byId("idCompanyCode").setValue("");

            var idUnloadMaterialTableBinding = this.getView().byId("idUnloadMaterialTable").getTable().getBinding("items");

            idUnloadMaterialTableBinding.filter([]);
            this.oFilterBar.fireFilterChange();
        },

        onFilterChange: function (oEvent) {
            //   if (oEvent.getSource().getValue().length){
            this.oFilterBar.fireFilterChange(oEvent);
            //  }
        },

        onUnloadNewConsignment: function (oEvent) {
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("RouteNewConsignment")
        },

        onbeforeRebindTable: function (oEvent) {
            var mBindingParams = oEvent.getParameter("bindingParams");
            mBindingParams.sorter.push(new sap.ui.model.Sorter("CreatedAt", true));
        }
    });
});