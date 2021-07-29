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
                this.oRouter.getRoute("storeStockChildDetail").attachPatternMatched(this._onObjectMatched, this);


            },

            _onObjectMatched: function (oEvent) {



                // flexible column layout rendering
                var sLayout = oEvent.getParameter("arguments").layout;

                // this.loadStoreStockChildTabData();


                this.getView().getModel("layoutModel").setProperty("/layout", sLayout);

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

            loadStoreStockChildTabData: function (oBindingContextPath, sItemPath) {
                var that = this;
                oBindingContextPath = oBindingContextPath + "/UOMs"
                var oModel = this.getView().getModel();
                oModel.read(oBindingContextPath, {
                    success: function (oData, oResponse) {
                        if (oData.results.length)
                            this.getView().getModel("ManageBOQModel").setProperty(sItemPath + "/UOMSuggestions", oData.results);
                        else
                            this.getView().getModel("ManageBOQModel").setProperty(sItemPath + "/UOMSuggestions", null);
                    }.bind(this),
                    error: function (oError) {
                        sap.m.MessageBox.error("Error fetching UOMs");
                    }
                });
            },
            onPurchaseOrderPress: function (oEvent) {
                // The source is the list item that got pressed
                this._showObject(oEvent.getSource());
            },

            _showObject: function (oItem) {
                var that = this;
                // var sObjectPath = oItem.getBindingContext().sPath;

                this.oRouter.navTo("RouteApp", {
                    parentMaterial: 1,
                    layout: "OneColumn"
                },


                    false
                );
                this.getView().getModel("layoutModel").setProperty("/layout", "OneColumn");

            }




        });
    });
