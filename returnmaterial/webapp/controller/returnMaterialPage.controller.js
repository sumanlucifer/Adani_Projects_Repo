sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/Fragment",
    "sap/ui/model/Sorter",
    "sap/ui/Device",
    'sap/ui/core/ValueState'

],

    function (BaseController, JSONModel, Filter, FilterOperator, Fragment, Sorter, Device, ValueState) {
        "use strict";
        return BaseController.extend("com.agel.mmts.returnmaterial.controller.returnMaterialPage", {

            onInit: function () {
               //Router Object
                this.oRouter = this.getRouter();
                this.oRouter.getRoute("RouteApp").attachPatternMatched(this._onObjectMatched, this);

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
            //    this.initializeFilterBar();            

            },

            _onObjectMatched: function (oEvent) {
                
            },

            // on Go Search 
            onSearch: function (oEvent) {
                var searchField = this.byId("idSearchInput").getValue();
                var DateValue = this.byId("DP1");
                var MaterialCode = this.byId("idMaterialCode").getValue();
                var PlantCode = this.byId("idSelPlant").getValue();

                var orFilters = [];
                var andFilters = [];

                var FreeTextSearch = this.byId("filterbar").getBasicSearchValue();
                if (FreeTextSearch) {
                    orFilters.push(new Filter("PONumber", FilterOperator.Contains, FreeTextSearch));
                    orFilters.push(new Filter("Buyer/CompanyCode", FilterOperator.EQ, FreeTextSearch));
                    orFilters.push(new Filter("ParentLineItems/MaterialCode", FilterOperator.EQ, FreeTextSearch));
                    orFilters.push(new Filter("PlantCode", FilterOperator.EQ, FreeTextSearch));
                    orFilters.push(new Filter("ParentLineItems/Name", FilterOperator.Contains, FreeTextSearch));
                    andFilters.push(new Filter(orFilters, false));
                }

                if (poNumber != "") {
                    andFilters.push(new Filter("PONumber", FilterOperator.EQ, poNumber));
                }

                if (DateRangeValue != "") {
                    var From = new Date(DateRange.getFrom());
                    var To = new Date(DateRange.getTo());
                    andFilters.push(new Filter("POReleaseDate", FilterOperator.BT, From.toISOString(), To.toISOString()));
                }

                if (CompanyCode != "") {
                    andFilters.push(new Filter("Buyer/CompanyCode", FilterOperator.EQ, CompanyCode));
                }

                if (MaterialCode != "") {
                    andFilters.push(new Filter("ParentLineItems/MaterialCode", FilterOperator.EQ, MaterialCode));
                }

                if (PlantCode != "") {
                    andFilters.push(new Filter("PlantCode", FilterOperator.EQ, PlantCode));
                }

                var idOpenPOTableBinding = this.getView().byId("idPurchaseOrdersTable").getTable().getBinding("items");
                var idConfirmPOTableBinding = this.getView().byId("idConfirmPOTable").getTable().getBinding("items");
                var idDispatchedPOTableBinding = this.getView().byId("idDispatchedPOTable").getTable().getBinding("items");

                if (andFilters.length == 0) {
                    andFilters.push(new Filter("PONumber", FilterOperator.NE, ""));
                    idOpenPOTableBinding.filter(new Filter(andFilters, true));
                    idConfirmPOTableBinding.filter(new Filter(andFilters, true));
                    idDispatchedPOTableBinding.filter(new Filter(andFilters, true));
                }

                if (andFilters.length > 0) {
                    idOpenPOTableBinding.filter(new Filter(andFilters, true));
                    idConfirmPOTableBinding.filter(new Filter(andFilters, true));
                    idDispatchedPOTableBinding.filter(new Filter(andFilters, true));
                }
                // oTableBinding.filter(mFilters);
            },

            onPurchaseOrderPress: function (oEvent) {
                // The source is the list item that got pressed
                this._showObject(oEvent.getSource());
            },

            _showObject: function (oItem) {
                var that = this;
                var sObjectPath = oItem.getBindingContext().sPath;
                that.getRouter().navTo("storeStockChildDetail", {
                    POId: sObjectPath.slice("/PurchaseOrderSet".length) // /PurchaseOrders(123)->(123)
                });
            }

        });
    });
