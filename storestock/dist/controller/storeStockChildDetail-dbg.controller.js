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
                this.getView().addEventDelegate({
                    onAfterShow: this.onBeforeShow,
                }, this);
                //view model instatiation
                var oViewModel = new JSONModel({
                    busy: false,
                    delay: 0
                });
                this.setModel(oViewModel, "objectViewModel");

                this.oRouter = this.getRouter();
                this.oRouter.getRoute("storeStockChildDetail").attachPatternMatched(this._onObjectMatched, this);


            },

            _onObjectMatched: function (oEvent) {



                // flexible column layout rendering
                var sLayout = oEvent.getParameter("arguments").layout;
                var sObjectId = oEvent.getParameter("arguments").parentMaterial;



                this._bindView("/StockParentItemSet" + sObjectId);

                this.getView().getModel("layoutModel").setProperty("/layout", sLayout);

                //}
            },

            _bindView: function (sObjectPath) {
                var objectViewModel = this.getViewModel("objectViewModel");
                var that = this;

                this.getView().bindElement({
                    path: sObjectPath,
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
            // on Go Search 
            onSearch: function (oEvent) {




                var MaterialName = this.byId("idChildMaterialName").getValue();
                var MaterialCode = this.byId("idChildMaterialCode").getValue();


                var orFilters = [];
                var andFilters = [];



                if (MaterialName != "") {
                    orFilters.push(new Filter("Name", FilterOperator.EQ, MaterialName));
                }
                if (MaterialCode != "") {
                    orFilters.push(new Filter("MaterialCode", FilterOperator.EQ, MaterialCode));
                }

                andFilters.push(new Filter(orFilters, false));


                var idChildTableBinding = this.getView().byId("idStoreStockChildTable").getTable().getBinding("items");



                if (andFilters.length > 0) {
                    idChildTableBinding.filter(new Filter(andFilters, true));
                  
                }



            },



            onCloseChildPage: function (oEvent) {
                // The source is the list item that got pressed
                this._showObject(oEvent.getSource());
            },

            _showObject: function (oItem) {
                var that = this;
                var sObjectPath = oItem.getBindingContext().sPath;

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
