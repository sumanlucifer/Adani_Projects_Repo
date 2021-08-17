sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/Fragment",
    "sap/ui/model/Sorter",
    "sap/ui/Device",
    'sap/m/MessageToast',
    "sap/m/MessageBox",
    'sap/ui/core/ValueState'
],
    function (BaseController, JSONModel, Filter, FilterOperator, Fragment, Sorter, Device, MessageToast, MessageBox, ValueState) {
        "use strict";
        return BaseController.extend("com.agel.mmts.raiseconsumptionporequest.controller.RaiseConsumptionPage", {
            onInit: function () {
                //Router Object
                this.oRouter = this.getRouter();
                //view model instatiation
                var oViewModel = new JSONModel({
                    busy: false,
                    delay: 0
                });
                this.setModel(oViewModel, "objectViewModel");
                // Main Model Set
                this.MainModel = this.getComponentModel();
                this.getView().setModel(this.MainModel);
            },
            _onObjectMatched: function (oEvent) {
            },
            // on Go Search 
            onSearch: function () {
                var that = this;
                this.validateSONumber();
            },
            // Validate QR Code
            validateSONumber: function () {
                var that = this;
                var SoID = this.getView().byId("idSoNumber").getValue();
                var SoIDFilter = new sap.ui.model.Filter({
                    path: "ID",
                    operator: sap.ui.model.FilterOperator.EQ,
                    value1: SoID
                });
                var filter = [];
                filter.push(SoIDFilter);
                this.MainModel.read("/SONumberDetailsSet", {
                    filters: [filter],
                    success: function (oData, oResponse) {
                        if (oData) {
                            //  
                            if (oData.results.length) {
                                that.oRouter.navTo("RouteReturnConsumptionDetailPage", {
                                    SOId: oData.results[0].ID,
                                }, false);
                            } else {
                                sap.m.MessageBox.error("Please Enter Valid SO Number");
                            }
                        } else {
                            sap.m.MessageBox.error("Please Enter Valid SO Number");
                        }
                    }.bind(this),
                    error: function (oError) {
                        sap.m.MessageBox.error(JSON.stringify(oError));
                    }
                });
            }
        });
    });
