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

    return BaseController.extend("com.agel.mmts.returnmaterial.controller.ReturnMaterialDetailPage", {
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
            this.getView().setModel(oViewModel, "objectViewModel");

            // Keeps reference to any of the created sap.m.ViewSettingsDialog-s in this sample
            this._mViewSettingsDialogs = {};

            // Main Model Set
            this.MainModel = this.getOwnerComponent().getModel();
            this.getView().setModel(this.MainModel);

            //Router Object
            this.oRouter = this.getRouter();
            this.oRouter.getRoute("RouteReturnDetailPage").attachPatternMatched(this._onObjectMatched, this);
        },

        _onObjectMatched: function (oEvent) {
            var that = this;
            var sObjectId = oEvent.getParameter("arguments").Id;
            that.sObjectId = sObjectId;
            this._bindView("/ReturnMaterialRequestSet(" + sObjectId + ")");
        },

        _bindView: function (sObjectPath) {
            var that = this;
            var objectViewModel = this.getView().getModel("objectViewModel");

            this.getView().bindElement({
                path: sObjectPath,
                events: {
                    dataRequested: function () {
                        objectViewModel.setProperty("/busy", true);
                    },
                    dataReceived: function () {
                        objectViewModel.setProperty("/busy", false);
                        that.onReadDataIssueMaterialParents();
                    }
                }
            });
        },

        getViewSettingsDialog: function (sDialogFragmentName) {
            var pDialog = this._mViewSettingsDialogs[sDialogFragmentName];

            if (!pDialog) {
                pDialog = Fragment.load({
                    id: this.getView().getId(),
                    name: sDialogFragmentName,
                    controller: this
                }).then(function (oDialog) {
                    if (Device.system.desktop) {
                        oDialog.addStyleClass("sapUiSizeCompact");
                    }
                    return oDialog;
                });
                this._mViewSettingsDialogs[sDialogFragmentName] = pDialog;
            }
            return pDialog;
        },

        onReadDataIssueMaterialParents: function () {
            var that = this;

            that.oIssueMaterialModel = new JSONModel();
            this.MainModel.read("/ReturnMaterialRequestSet(" + that.sObjectId + ")", {
                urlParameters: { "$expand": "MaterialReturnParentItems/MaterialReturnBOQItem" },
                success: function (oData, oResponse) {
                    debugger;
                    that.dataBuilding(oData.MaterialReturnParentItems.results);
                    //   that.oIssueMaterialModel.setData({ "Items": oData.results });
                    //   oTable.setModel(that.oIssueMaterialModel, "oIssueMaterialModel");
                    // that.onReadDataIssueMaterialChild(oData.results);
                }.bind(this),
                error: function (oError) {
                    sap.m.MessageBox.error("Data Not Found");
                }
            });
        },

        dataBuilding: function (ParentData) {
            this.ParentDataView = ParentData;
            for (var i = 0; i < ParentData.length; i++) {
                //  for (var j = 0; j < ParentData[i].MDCCBOQItems.length; j++) {
                if (ParentData[i].MaterialReturnBOQItem.results.length) {
                    this.ParentDataView[i].isStandAlone = true;
                    this.ParentDataView[i].ChildItemsView = ParentData[i].MaterialReturnBOQItem.results;
                }
                else {
                    this.ParentDataView[i].isStandAlone = false;
                    this.ParentDataView[i].ChildItemsView = [];
                }
                //   }
            }
            this.arrangeDataView();
        },

        // Arrange Data For View / Model Set
        arrangeDataView: function (ParentDataView) {
            var that = this;
            var oModel = new JSONModel({ "ChildItemsView": this.ParentDataView });
            this.getView().setModel(oModel, "TreeTableModelView");
            var oTable = this.byId("TreeTable");
            oTable.setModel(oModel);
            oTable.getModel("TreeTableModelView").refresh();
        },

        onReadDataIssueMaterialChild: function (ParentData) {

        },

    });
});