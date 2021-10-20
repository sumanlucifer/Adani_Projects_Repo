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
        return BaseController.extend("com.agel.mmts.storestock.controller.storeStockParentDetail", {

            onInit: function () {
                this.mainModel = this.getOwnerComponent().getModel();
                this.mainModel.setSizeLimit(1000);
                this.oRouter = this.getRouter();
                var oModel = this.getOwnerComponent().getModel("layoutModel");
                oModel.setProperty("/layout", "OneColumn");

                // Icon Tab Count Model
                var oIconTabCountModel = new JSONModel({
                    restrictedCount: null,
                    unrestrictedCount: null
                });
                this.setModel(oIconTabCountModel, "oIconTabCountModel");

                var oPlantModel = new JSONModel({
                    PlntItems: []
                });
                this.setModel(oPlantModel, "PlantModel");

                var mockPlantData = [{
                    key: "4500327800",
                    value: "AG-234"


                },
                {
                    key: "4500327801",
                    value: "AG-34"


                },
                {
                    key: "4600327832",
                    value: "AG-67"


                }

                ];


                this.getViewModel("PlantModel").setProperty("/PlntItems", mockPlantData);

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


            onBeforeRebindUnrestTable: function (oEvent) {
                var mBindingParams = oEvent.getParameter("bindingParams");
                // mBindingParams.filters.push(new Filter("Status", sap.ui.model.FilterOperator.EQ, "APPROVED"));   
                mBindingParams.sorter.push(new sap.ui.model.Sorter("CreatedAt", true));

            },

            onBeforeRebindRestTable: function (oEvent) {
                var mBindingParams1 = oEvent.getParameter("bindingParams");
                mBindingParams1.filters.push(new Filter("Status", sap.ui.model.FilterOperator.EQ, "RESTRICTED"));   
                mBindingParams1.sorter.push(new sap.ui.model.Sorter("CreatedAt", true));
            },

            // on Go Search 
            onSearch: function (oEvent) {

                var MaterialName = this.byId("idParentMaterialName").getValue();
                var MaterialCode = this.byId("idParentMaterialCode").getValue();
                var PlantCode = this.byId("idSelPlant").getSelectedKey();
                // var PlantCode = "4500327800";

                var orFilters = [];
                var andFilters = [];

                if (PlantCode !== "") {

                    this.byId("idParentUnRestrictedTable").mProperties.enableAutoBinding = true;
                    this.byId("idParentUnRestrictedTable").rebindTable();
                    this.byId("idParentRestrictedTable").mProperties.enableAutoBinding = true;
                    this.byId("idParentRestrictedTable").rebindTable();
                    andFilters.push(new Filter("PlantCode", FilterOperator.EQ, PlantCode));
                }
                else {
                    this.byId("unrestrictedTable").setNoDataText(this.getResourceBundle().getText("EnterPlant"));
                    this.byId("restrictedTable").setNoDataText(this.getResourceBundle().getText("EnterPlant"));
                    return false;
                }

                if (MaterialName != "") {
                    andFilters.push(new Filter("Name", FilterOperator.EQ, MaterialName));
                }
                if (MaterialCode != "") {
                    andFilters.push(new Filter("MaterialCode", FilterOperator.EQ, MaterialCode));
                }

                // andFilters.push(new Filter(orFilters, false));


                var idUnRestrictedTableBinding = this.getView().byId("idParentUnRestrictedTable").getTable().getBinding("items");
                var idRestrictedTableBinding = this.getView().byId("idParentRestrictedTable").getTable().getBinding("items");



                if (andFilters.length > 0) {
                    idUnRestrictedTableBinding.filter(new Filter(andFilters, true));
                    idRestrictedTableBinding.filter(new Filter(andFilters, true));
                }



            },


            //triggers on press of a Stock cheveron item from the list
            onRestrictdParentTablePress: function (oEvent) {
                // The source is the list item that got pressed
                this._showObject(oEvent.getSource());
            },

            _showObject: function (oItem) {


                var that = this;
                var sObjectPath = oItem.getBindingContext().sPath;

                this.oRouter.navTo("storeStockChildDetail", {
                    parentMaterial: sObjectPath.slice("/RestrictedStoreStockParentSet".length),// /StockParentItemSet(123)->(123)
                    layout: "TwoColumnsMidExpanded"
                },


                    false
                );
            },

            onRestrictedStockUpdateFinished: function (oEvent) {
                //Setting the header context for a property binding to $count
                this.setIconTabCount(oEvent, oEvent.getParameter("total"), "/restrictedCount");
            },

            onUnrestrictedStockUpdateFinished: function (oEvent) {
                //Setting the header context for a property binding to $count
                this.setIconTabCount(oEvent, oEvent.getParameter("total"), "/unrestrictedCount");
            },

            setIconTabCount: function (oEvent, total, property) {
                if (oEvent.getSource().getBinding("items").isLengthFinal()) {
                    this.getView().getModel("oIconTabCountModel").setProperty(property, total);
                }
            }




        });
    });
