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
            onChangeSONumber: function (oEvent) {
                debugger;
                var oValue = oEvent.getSource().getValue();
                if (!oValue.match(/^\d{4}$/)) {

                    this.getView().byId("idSoNumber").setValueState("Error");
                    this.getView().byId("idSoNumber").setValueStateText("Please Enter upto 10 digit Number");
                     this.getView().byId("SObtnSubmit").setEnabled(false);
                    return;
                }
                else {
                    this.getView().byId("idSoNumber").setValueState("None");
                    this.getView().byId("idSoNumber").setValueStateText(null);
                    this.getView().byId("SObtnSubmit").setEnabled(true);

                }


            },
            // Validate QR Code
            validateSONumber: function () {
                var that = this;

                var objectViewModel = that.getViewModel("objectViewModel");
                objectViewModel.setProperty("/busy", true);
                var SoID = this.getView().byId("idSoNumber").getValue();
                var SoIDFilter = new sap.ui.model.Filter({
                    path: "SONumber",
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
                                objectViewModel.setProperty("/busy", false);
                                that.oRouter.navTo("RouteReturnConsumptionDetailPage", {
                                    SOId: oData.results[0].ID,
                                }, false);
                            } else {
                                objectViewModel.setProperty("/busy", false);
                                sap.m.MessageBox.error("Please Enter Valid SO Number");
                            }
                        } else {
                            objectViewModel.setProperty("/busy", false);
                            sap.m.MessageBox.error("Please Enter Valid SO Number");
                        }
                    }.bind(this),
                    error: function (oError) {
                        objectViewModel.setProperty("/busy", false);
                        sap.m.MessageBox.error(JSON.stringify(oError));
                    }
                });
            }
        });
    });
