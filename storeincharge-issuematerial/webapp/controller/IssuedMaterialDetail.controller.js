sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    // "sap/ui/model/Filter",
    // "sap/ui/model/FilterOperator",
    // "sap/ui/core/Fragment",
    // "sap/ui/model/Sorter",
    // "sap/ui/Device",
    // "sap/ui/core/routing/History",
    // 'sap/m/ColumnListItem',
    // 'sap/m/Input',
    // 'sap/base/util/deepExtend',
    // 'sap/ui/export/Spreadsheet',
    // 'sap/m/MessageToast',
    // "sap/m/MessageBox",
    // "sap/m/ObjectIdentifier",
    // "sap/m/Text",
    // "sap/m/Button",
    // "sap/m/Dialog",
    '../utils/formatter',
], function (BaseController, JSONModel, formatter) {
    "use strict";

    return BaseController.extend("com.agel.mmts.storeinchargeissuematerial.controller.IssuedMaterialDetail", {
        formatter: formatter,
        onInit: function () {
            this.getView().addEventDelegate({
                onAfterShow: this.onBeforeShow,
            }, this);
            //view model instatiation
            var oViewModel = new JSONModel({
                busy: false,
                delay: 0,
                boqSelection: null,
                csvFile: "file",
                doneButton: true,
                reserveButton: true
            });
            this.setModel(oViewModel, "objectViewModel");

            //    this._initializeCreationModels();
            this.MainModel = this.getComponentModel();
            this.getView().setModel(this.MainModel);

            // Keeps reference to any of the created sap.m.ViewSettingsDialog-s in this sample
            this._mViewSettingsDialogs = {};

            //Router Object
            this.oRouter = this.getRouter();
            this.oRouter.getRoute("IssuedMaterialDetails").attachPatternMatched(this._onObjectMatched, this);
        },

        _onObjectMatched: function (oEvent) {
            // debugger;
            this.sObjectId = oEvent.getParameter("arguments").ID;
            this._bindView("/IssuedMaterialSet" + this.sObjectId);
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
                        that._setTreeTableData(that);
                    }
                }
            });
        },

        _setTreeTableData: function (oController) {
            var objectViewModel = oController.getViewModel("objectViewModel");
            objectViewModel.setProperty(
                "/busy",
                true
            );
            oController.MainModel.read("/IssuedMaterialSet" + oController.sObjectId + "/IssuedMaterialParents", {
                urlParameters: { "$expand": "IssuedMaterialBOQ,IssuedMaterialReservedItem" },
                success: function (oData) {
                    objectViewModel.setProperty(
                        "/busy",
                        false
                    );
                    if (oData) {
                        oData.results.forEach(element => {
                            element.BoqItems = element.IssuedMaterialBOQ.results;
                            element.ReservedQty = element.IssuedMaterialReservedItem.ReservedQty;
                        });
                        objectViewModel.setProperty("/TreeTableData", oData.results);
                    }
                }.bind(oController),
                error: function (oErr) {

                    objectViewModel.setProperty(
                        "/busy",
                        false
                    );

                }.bind(oController),
            })
        },
        handleToIssueMatBreadcrumPress: function () {
            this.getRouter().navTo("RouteLandingPage");
        }

    });
});