sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/Fragment",
    "sap/ui/model/Sorter",
    "sap/ui/Device",
    "sap/ui/core/routing/History",
    'sap/m/ColumnListItem',
    'sap/m/Input',
    'sap/base/util/deepExtend',
    'sap/ui/export/Spreadsheet',
    'sap/m/MessageToast',
    "sap/m/MessageBox",
    "sap/m/ObjectIdentifier",
    "sap/m/Text",
    "sap/m/Button",
    "sap/m/Dialog",
    '../utils/formatter',
], function (BaseController, JSONModel, Filter, FilterOperator, Fragment, Sorter, Device, History, ColumnListItem, Input, deepExtend, Spreadsheet, MessageToast, MessageBox, ObjectIdentifier, Text, Button, Dialog, formatter) {
    "use strict";

    return BaseController.extend("com.agel.mmts.raisereturnmaterial.controller.RaiseRequestDetailPage", {
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
                csvFile: "file"
            });
            this.setModel(oViewModel, "objectViewModel");

            //    this._initializeCreationModels();

            // Keeps reference to any of the created sap.m.ViewSettingsDialog-s in this sample
            this._mViewSettingsDialogs = {};

            // get Owener Component Model

            // Main Model Set
            this.MainModel = this.getComponentModel();
            this.getView().setModel(this.MainModel);

            //Router Object
            this.oRouter = this.getRouter();
            this.oRouter.getRoute("RaiseRequestDetailPage").attachPatternMatched(this._onObjectMatched, this);
        },

        _onObjectMatched: function (oEvent) {
            var that = this;
            var sObjectId = oEvent.getParameter("arguments").SOId;
            that.sObjectId = sObjectId;
            this._bindView("/SONumberDetailsSet(" + sObjectId + ")");
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
                       that.onReadDataIssueMaterials();
                    }
                }
            });
        },

     

        onPressRetrunAsset: function (oEvent) {
            //  debugger;
            //  var sObjectId = oEvent.getSource();
            oEvent.getSource().getParent().getCells()[6].getItems()[0].setEditable(true);
            oEvent.getSource().getParent().getCells()[6].getItems()[1].setVisible(true);
        },

        onPressSave: function (oEvent) {
            oEvent.getSource().getParent().getParent().getCells()[6].getItems()[0].setEditable(false);
            oEvent.getSource().getParent().getParent().getCells()[6].getItems()[1].setVisible(false);
        },

        onCancelAssistanceRequestPress: function (oEvent) {
            this._oQRAssistantDialog.close();
        },

        onPressSubmitRequest: function (oEvent) {
            //initialize the action
            var oModel = new JSONModel({
                "reason": null,
                "comment": null
            });
            this.getView().setModel(oModel, "qrAssistantModel")
            if (!this._oQRAssistantDialog) {
                this._oQRAssistantDialog = sap.ui.xmlfragment("com.agel.mmts.raisereturnmaterial.view.fragments.Reason", this);
                this.getView().addDependent(this._oQRAssistantDialog);
            }
            this._oQRAssistantDialog.open();
        },

        onSendAssistanceRequestPress: function (oEvent) {
            var that = this;
            var inputModel = this.getView().getModel("qrAssistantModel");
            var flag = 0;
            if (inputModel.getProperty("/comment") == null || inputModel.getProperty("/comment") == "") {
                flag = 1;
            }

            if (inputModel.getProperty("/reason") == null || inputModel.getProperty("/reason") == "") {
                flag = 1;
            }

            if (flag == 1) {
                sap.m.MessageBox.error("Please fill mandatory fields");
                return 0;
            }

            var oTable = this.byId("idTblIssueMaterialItems");
            var aItems = oTable.getModel("oIssueMaterialModel").getData().Items;

            var aNewItems = aItems.map(obj => ({ ...obj, IssuedMaterialItemId: obj.ID }))

            var oPayload = {
                "SONumber": this.getView().getBindingContext().getObject().SONumber,
                "UserName": "Test",
                "ContractorId": 7,
                "ReasonToReturnMaterialId": 1,
                //inputModel.getProperty("/reason")
                "Comment": inputModel.getProperty("/comment"),
                "Materials": aNewItems
            };

            this.MainModel.create("/RaiseReturnMaterialRequestSet", oPayload, {
                success: function (oData, oResponse) {
                    that._oQRAssistantDialog.close();
                    sap.m.MessageBox.success("Request submit successfully!")
                }.bind(this),
                error: function (oError) {
                    sap.m.MessageBox.error(oError.Message);
                }
            });
        },

          onReadDataIssueMaterials: function () {
                var that = this;
                var oTable = this.byId("idTblIssueMaterialItems");
                that.oIssueMaterialModel = new JSONModel();
                this.MainModel.read("/SONumberDetailsSet(" + that.sObjectId + ")/IssuedMaterials", {
                    success: function (oData, oResponse) {
                        that.oIssueMaterialModel.setData({ "Items": oData.results });
                        oTable.setModel(that.oIssueMaterialModel, "oIssueMaterialModel");
                    }.bind(this),
                    error: function (oError) {
                        sap.m.MessageBox.error("Data Not Found");
                    }
                });
            },

    });
});