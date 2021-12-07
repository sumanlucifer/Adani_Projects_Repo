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
    return BaseController.extend("com.agel.mmts.engineerissuecancellation.controller.IssueDetailPage", {
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
                cancelbutton: false,
                reserveButton: true
            });
            this.setModel(oViewModel, "objectViewModel");
            this.MainModel = this.getComponentModel();
            //    this._initializeCreationModels();
            // Keeps reference to any of the created sap.m.ViewSettingsDialog-s in this sample
            this._mViewSettingsDialogs = {};
            //Router Object
            this.oRouter = this.getRouter();
            this.oRouter.getRoute("IssueDetailPage").attachPatternMatched(this._onObjectMatched, this);
        },
        _onObjectMatched: function (oEvent) {
            var sObjectId = oEvent.getParameter("arguments").ID;
            this.sObjectId = sObjectId;
            this._bindView("/IssuedMaterialSet(" + sObjectId + ")");
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
                        that.onReadDataIssueMaterialParents();
                    }
                }
            });
        },

        onReadDataIssueMaterialParents: function () {
            var that = this;
            that.oIssueMaterialModel = new JSONModel();
            this.MainModel.read("/IssuedMaterialSet(" + that.sObjectId + ")/IssuedMaterialParents", {
                urlParameters: { "$expand": "IssuedMaterialReservedItem/IssueMaterialReserve" },
                success: function (oData, oResponse) {
                    this.dataBuilding(oData.results);
                    //          var consumptionData = new JSONModel(oData.results);
                    // this.getView().setModel(consumptionData, "consumptionData");
                }.bind(this),
                error: function (oError) {
                    sap.m.MessageBox.error(this.getResourceBundle().getText("DataNotFound"));
                }
            });
        },

        getTableItems: function () {
            var itemData = this.getViewModel("consumptionData").getData();
            var IsAllItemsConsumed = "";
            var totalItems = itemData.filter(function (item) {
                return (item.Status === "ISSUED" || item.Status === "RESERVED");
            });
            var selectedItems = itemData.filter(function (item) {
                return item.isSelected === true;
            });
            if (totalItems.length === selectedItems.length)
                IsAllItemsConsumed = true;
            else
                IsAllItemsConsumed = false;
            return {
                selectedItems,
                IsAllItemsConsumed
            };
        },

        dataBuilding: function (ItemData) {
            for (var i = 0; i < ItemData.length; i++) {
                ItemData[i].isSelected = false;
            }
            var consumptionData = new JSONModel(ItemData);
            this.getView().setModel(consumptionData, "consumptionData");
        },


        handleToAllPOBreadcrumPress: function (oEvent) {
            history.go(-1);
        },

        onSelectAll: function (oEvent) {
            var isSelected = oEvent.getSource().getSelected();
            var ItemData = this.getView().getModel("consumptionData").getData();
            if (isSelected) {
                for (var i = 0; i < ItemData.length; i++) {
                    ItemData[i].isSelected = true;
                }
                this.getView().getModel("objectViewModel").setProperty("/cancelbutton", true);
            }
            else {
                for (var i = 0; i < ItemData.length; i++) {
                    ItemData[i].isSelected = false;
                }
                this.getView().getModel("objectViewModel").setProperty("/cancelbutton", false);

            }
            this.getView().getModel("consumptionData").setData(ItemData);
        },

        onSelectionOfRow: function (oEvent) {
            // var isSelected = oEvent.getSource().getSelected();
            var ItemData = this.getView().getModel("consumptionData").getData();
            for (var i = 0; i < ItemData.length; i++) {
                if (ItemData[i].isSelected === true) {
                    this.getView().getModel("objectViewModel").setProperty("/cancelbutton", true);
                    break;
                }
                else
                    this.getView().getModel("objectViewModel").setProperty("/cancelbutton", false);
            }

        },

        onPressCancelIssuePosting: function (oEvent) {
            var that = this;
            var ConsumptionPostingReserveId = that.sObjectId;
            var itemData = this.getTableItems();
            // var ConsumptionPostingId = oEvent.getSource().getBindingContext().getObject().ConsumptionPostingId;
            var sMessage = this.getResourceBundle().getText("CancelIssuePostingMSG");
            MessageBox.confirm(sMessage, {
                icon: MessageBox.Icon.INFORMATION,
                title: "Confirm",
                actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                emphasizedAction: MessageBox.Action.YES,
                onClose: function (oAction) {
                    if (oAction == "YES") {
                        that.onSubmitCancelConfirmPress(ConsumptionPostingReserveId, itemData);
                    }
                }
            });
        },

        onSubmitCancelConfirmPress: function (ConsumptionPostingReserveId, itemData) {
            var IsAllItemsConsumed = itemData.IsAllItemsConsumed;
            itemData = itemData.selectedItems.map(function (item) {
                return {
                    IssuedMaterialParentId: item.ID
                };
            });
            var oPayload = {
                "IssuedMaterialId": this.sObjectId,
                "UserName": "AGEL_TEST",
                "ParentItem": itemData
            };
            this.getOwnerComponent().getModel().create("/IssueMaterialCancellationEdmSet", oPayload, {
                success: function (oData, oResponse) {
                    this.getView().getModel("objectViewModel").setProperty("/cancelbutton", false);
                    this.getOwnerComponent().getModel().refresh();
                    if (oData.Success === true) {
                        sap.m.MessageBox.success(this.getResourceBundle().getText("IssuedPostingCancelMSG"));
                    }
                    else {
                        sap.m.MessageBox.error(oData.Message);
                    }
                }.bind(this),
                error: function (oError) {
                    this.getView().getModel("objectViewModel").setProperty("/cancelbutton", false);
                    sap.m.MessageBox.error(this.getResourceBundle().getText("DataNotFound"));
                }
            });
        }
    });
});