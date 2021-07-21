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
        return BaseController.extend("com.agel.mmts.storestock.controller.storeStockChildDetail", {

            onInit: function () {

                this.oRouter = this.getRouter();
                //this.oRouter.getRoute("RouteDetailPage").attachPatternMatched(this._onObjectMatched, this);

            },

            _onObjectMatched: function (oEvent) {
                var startupParams = this.getOwnerComponent().getComponentData().startupParameters;
                // get Startup params from Owner Component
                //if (startupParams.Kind[0]) {
                this.type = startupParams.Kind[0];
                this.byId("idIconTabBar").setSelectedKey(this.type);
                this.onIconTabBarChanged(this.type);
                //}
            },
            // on Go Search 
            onSearch: function (oEvent) {
                var poNumber = this.byId("idNameInput").getValue();
                var DateRange = this.byId("dateRangeSelectionId");
                var DateRangeValue = this.byId("dateRangeSelectionId").getValue();
                var PlantCode = this.byId("idPlantCode").getValue();
                var MaterialCode = this.byId("idMaterialCode").getValue();
                var CompanyCode = this.byId("idCompanyCode").getValue();
                //  var CompanyCode = this.byId("idCompanyCode").getValue();
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
                that.getRouter().navTo("RoutePODetailPage", {
                    POId: sObjectPath.slice("/PurchaseOrderSet".length) // /PurchaseOrders(123)->(123)
                });
            }




        });
    });
