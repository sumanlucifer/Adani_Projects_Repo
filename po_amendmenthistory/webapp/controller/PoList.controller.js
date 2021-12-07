sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    // "sap/ui/core/Fragment",
    // "sap/ui/Device",
],
	/**
	 * @param {typeof sap.ui.core.mvc.Controller} Controller
	 */
    function (BaseController, JSONModel, Filter, FilterOperator) {
        "use strict";

        return BaseController.extend("com.agel.mmts.poamendmenthistory.controller.PoList", {
            onInit: function () {
                //Router Object
                this.oRouter = this.getRouter();
                this.oRouter.getRoute("RoutePoList").attachPatternMatched(this._onObjectMatched, this);

                //view model instatiation
                var oViewModel = new JSONModel({
                    busy: false,
                    delay: 0
                });
                this.setModel(oViewModel, "objectViewModel");

                //adding searchfield association to filterbar and initialize the filter bar -> added in base controller
                this.initializeFilterBar();
            },

            _onObjectMatched: function (oEvent) {

            },

            //Triggers on press of a PO Number item from the list
            onPurchaseOrderPress: function (oEvent) {
                var sObjectPath = oEvent.getSource().getBindingContext().sPath.split("/PurchaseOrderSet")[1]
                this.getRouter().navTo("PoAmendmentHistory", {
                    PODetails: sObjectPath
                });
            },

            // Date Range Selection
            onDateRangeSelectionChange: function (oEvent) {
                var bValid = oEvent.getParameter("valid"),
                    oEventSource = oEvent.getSource();

                if (bValid) {
                    oEventSource.setValueState("None");
                } else {
                    oEventSource.setValueState("Error");
                }
                this.oFilterBar.fireFilterChange(oEvent);
            },

            // on Go Search 
            onSearch: function (oEvent) {
                var poNumber = this.byId("idNameInput").getValue(),
                    DateRange = this.byId("dateRangeSelectionId"),
                    PlantCode = this.byId("idPlantCode").getValue(),
                    MaterialCode = this.byId("idMaterialCode").getValue(),
                    CompanyCode = this.byId("idCompanyCode").getValue(),
                    orFilters = [],
                    andFilters = [];

                var FreeTextSearch = this.byId("filterbar").getBasicSearchValue();
                if (FreeTextSearch) {
                    orFilters.push(new Filter("PONumber", FilterOperator.Contains, FreeTextSearch));
                    orFilters.push(new Filter("MasterCompanyCode/CompanyCode", FilterOperator.EQ, FreeTextSearch));
                    orFilters.push(new Filter("ParentLineItems/MaterialCode", FilterOperator.EQ, FreeTextSearch));
                    orFilters.push(new Filter("PlantCode", FilterOperator.EQ, FreeTextSearch));
                    orFilters.push(new Filter("ParentLineItems/Name", FilterOperator.Contains, FreeTextSearch));
                    andFilters.push(new Filter(orFilters, false));
                }

                if (poNumber != "") {
                    andFilters.push(new Filter("PONumber", FilterOperator.EQ, poNumber));
                }

                if (DateRange.getValue() != "") {
                    var From = new Date(DateRange.getFrom()),
                        To = new Date(DateRange.getTo());
                    andFilters.push(new Filter("POReleaseDate", FilterOperator.BT, From.toISOString(), To.toISOString()));
                }

                if (CompanyCode != "") {
                    andFilters.push(new Filter("MasterCompanyCode/CompanyCode", FilterOperator.EQ, CompanyCode));
                }

                if (MaterialCode != "") {
                    andFilters.push(new Filter("ParentLineItems/MaterialCode", FilterOperator.EQ, MaterialCode));
                }

                if (PlantCode != "") {
                    andFilters.push(new Filter("PlantCode", FilterOperator.EQ, PlantCode));
                }

                var idOpenPOTableBinding = this.getView().byId("idPurchaseOrdersTable").getTable().getBinding("items");

                if (andFilters.length == 0) {
                    andFilters.push(new Filter("PONumber", FilterOperator.NE, ""));
                    idOpenPOTableBinding.filter(new Filter(andFilters, true));
                }

                if (andFilters.length > 0) {
                    idOpenPOTableBinding.filter(new Filter(andFilters, true));
                }
            },

            onResetFilters: function () {
                this.oFilterBar._oBasicSearchField.setValue("");
                this.byId("idNameInput").setValue("");
                this.byId("idMaterialCode").setValue("");
                this.byId("dateRangeSelectionId").setValue("");
                this.byId("idPlantCode").setValue("");
                this.byId("idCompanyCode").setValue("");

                var idOpenPOTableBinding = this.getView().byId("idPurchaseOrdersTable").getTable().getBinding("items");
                idOpenPOTableBinding.filter([]);
                this.oFilterBar.fireFilterChange();
            },

            onFilterChange: function (oEvent) {
                this.oFilterBar.fireFilterChange(oEvent);
            }
        });
    });

