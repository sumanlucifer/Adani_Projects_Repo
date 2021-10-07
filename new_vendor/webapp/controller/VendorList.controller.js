sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
],
	/**
	 * @param {typeof sap.ui.core.mvc.Controller} Controller
	 */
    function (BaseController, JSONModel, Filter, FilterOperator) {
        "use strict";

        return BaseController.extend("com.agel.mmts.newvendor.controller.VendorList", {
            onInit: function () {
                //Router Object
                this.oRouter = this.getRouter();
                this.oRouter.getRoute("RouteVendorList").attachPatternMatched(this._onObjectMatched, this);

                //jQuery.sap.addUrlWhitelist("blob");
                this.mainModel = this.getOwnerComponent().getModel();
                this.mainModel.setSizeLimit(1000);

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
            onNavigateVendorDetails: function (oEvent) {
                var sObjectPath = oEvent.getSource().getBindingContext().sPath;
                sObjectPath = sObjectPath.match(/\((.*?)l/)[1];
                this.getRouter().navTo("RouteVendorDetails", {
                    VendorDetails: sObjectPath
                });
            },

            // on Add new vendor button press
            onAddNewVendorPress: function (oEvent) {
                this.getRouter().navTo("RouteCreateVendor");
            },

            // on Go Search 
            onSearch: function (oEvent) {
                var sVendorCode = this.byId("idVendorCodeINP").getValue(),
                    // PlantCode = this.byId("idPlantIdCMB").getValue(),
                    // CompanyCode = this.byId("idCompanyCodeCMB").getValue(),
                    orFilters = [],
                    andFilters = [];

                var FreeTextSearch = this.byId("idFilterbar").getBasicSearchValue();
                if (FreeTextSearch) {
                    orFilters.push(new Filter("VendorCode", FilterOperator.Contains, FreeTextSearch));
                    orFilters.push(new Filter("Name", FilterOperator.Contains, FreeTextSearch));
                    // orFilters.push(new Filter("MasterCompanyCode/CompanyCode", FilterOperator.EQ, FreeTextSearch));
                    // orFilters.push(new Filter("PlantCode", FilterOperator.EQ, FreeTextSearch));
                    andFilters.push(new Filter(orFilters, false));
                }

                if (sVendorCode != "") {
                    andFilters.push(new Filter("VendorCode", FilterOperator.EQ, sVendorCode));
                }

                // if (CompanyCode != "") {
                //     andFilters.push(new Filter("MasterCompanyCode/CompanyCode", FilterOperator.EQ, CompanyCode));
                // }

                // if (PlantCode != "") {
                //     andFilters.push(new Filter("PlantCode", FilterOperator.EQ, PlantCode));
                // }

                var idOpenPOTableBinding = this.getView().byId("idVendorTable").getTable().getBinding("items");

                if (andFilters.length == 0) {
                    andFilters.push(new Filter("VendorCode", FilterOperator.NE, ""));
                    idOpenPOTableBinding.filter(new Filter(andFilters, true));
                }

                if (andFilters.length > 0) {
                    idOpenPOTableBinding.filter(new Filter(andFilters, true));
                }
            },

            onResetFilters: function () {
                this.oFilterBar._oBasicSearchField.setValue("");
                this.byId("idVendorCodeINP").setValue("");
                // this.byId("idPlantIdMCB").setValue("");
                // this.byId("idCompanyCodeMCB").setValue("");

                var idVendorBinding = this.getView().byId("idVendorTable").getTable().getBinding("items");
                idVendorBinding.filter([]);
                this.oFilterBar.fireFilterChange();
            },

            onFilterChange: function (oEvent) {
                this.oFilterBar.fireFilterChange(oEvent);
            }
        });
    });