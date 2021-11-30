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
        return BaseController.extend("com.agel.mmts.raisereturnmaterial.controller.RaiseRequestPage", {

            onInit: function () {
                //Router Object
                this.oRouter = this.getRouter();
                this.oRouter.getRoute("RaiseRequestPage").attachPatternMatched(this._onObjectMatched, this);

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
                this.getViewModel("objectViewModel").setProperty(
                    "/busy",
                    true
                );
                var that = this;
                var SoNumber = this.getView().byId("idSoNumber").getValue();
                that.sObjectId = SoNumber + "l";
                //that.sObjectId = SoID+"l";
                var SoIDFilter = new sap.ui.model.Filter({
                    path: "SONumber",
                    operator: sap.ui.model.FilterOperator.EQ,
                    value1: SoNumber
                });

                var filter = [];
                filter.push(SoIDFilter);

                this.MainModel.read("/SONumberDetailsSet", {
                    filters: [filter],
                    success: function (oData, oResponse) {
                        this.getViewModel("objectViewModel").setProperty(
                            "/busy",
                            false
                        );
                        if (oData) {
                            // debugger;
                            if (oData.results.length) {
                                //   that.onReadDataIssueMaterials();
                                that.oRouter.navTo("RaiseRequestDetailPage", {
                                    SOId: oData.results[0].ID
                                }, false);
                            } else {
                                sap.m.MessageBox.error("Please Enter Valid SO Number");
                            }
                        } else {
                            sap.m.MessageBox.error("Please Enter Valid SO Number");
                        }
                    }.bind(this),
                    error: function (oError) {
                        this.getViewModel("objectViewModel").setProperty(
                            "/busy",
                            false
                        );
                        //sap.m.MessageBox.error(JSON.stringify(oError));
                    }
                });
            },

            onReadDataIssueMaterials: function () {
                this.getViewModel("objectViewModel").setProperty(
                    "/busy",
                    true
                );
                var that = this;
                var oTable = this.byId("idTblIssueMaterialItems");
                oTable.setVisible(true);
                that.oIssueMaterialModel = new JSONModel();
                this.MainModel.read("/SONumberDetailsSet(" + that.sObjectId + ")/IssuedMaterials", {
                    success: function (oData, oResponse) {
                        this.getViewModel("objectViewModel").setProperty(
                            "/busy",
                            false
                        );
                        that.oIssueMaterialModel.setData({ "Items": oData.results });
                        oTable.setModel(that.oIssueMaterialModel, "oIssueMaterialModel");
                    }.bind(this),
                    error: function (oError) {
                        this.getViewModel("objectViewModel").setProperty(
                            "/busy",
                            false
                        );
                       // sap.m.MessageBox.error("Data Not Found");
                    }.bind(this),                });
            },

        });
    });
