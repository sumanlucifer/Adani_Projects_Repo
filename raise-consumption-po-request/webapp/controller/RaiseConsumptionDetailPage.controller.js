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
    return BaseController.extend("com.agel.mmts.raiseconsumptionporequest.controller.RaiseConsumptionDetailPage", {
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
            var oReservationData = new JSONModel({
                ReservationNumber: null,
                ReservationDate: null
            });
            this.setModel(oReservationData, "oReservationData");
            //    this._initializeCreationModels();
            // Keeps reference to any of the created sap.m.ViewSettingsDialog-s in this sample
            this._mViewSettingsDialogs = {};
            // get Owener Component Model
            // Main Model Set
            this.MainModel = this.getComponentModel();
            this.getView().setModel(this.MainModel);
            //Router Object
            this.oRouter = this.getRouter();
            this.oRouter.getRoute("RouteReturnConsumptionDetailPage").attachPatternMatched(this._onObjectMatched, this);
        },
        _onObjectMatched: function (oEvent) {
            var that = this;
            var sObjectId = oEvent.getParameter("arguments").ReservationID;
            this.sObjectId = sObjectId;
            this._bindView("/ConsumptionPostingReserveSet(" + sObjectId + ")");
        },
        _bindView: function (sObjectPath) {
            var objectViewModel = this.getViewModel("objectViewModel");
            var that = this;
            this.getView().bindElement({
                path: sObjectPath,
                events: {
                    change: this._onBindingChange.bind(that),
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
            this.MainModel.read("/ConsumptionPostingReserveSet(" + that.sObjectId + ")/ConsumedMaterialReserveItem", {
                // urlParameters: { "$expand": "ConsumedMaterialParent" },
                success: function (oData, oResponse) {
                    this.dataBuilding(oData.results);
                    //          var consumptionData = new JSONModel(oData.results);
                    // this.getView().setModel(consumptionData, "consumptionData");
                }.bind(this),
                error: function (oError) {
                    sap.m.MessageBox.error("Data Not Found");
                }
            });
        },
        dataBuilding: function (ItemData) {
            for (var i = 0; i < ItemData.length; i++) {
                ItemData[i].isSelected = false;
            }
            var consumptionData = new JSONModel(ItemData);
            this.getView().setModel(consumptionData, "consumptionData");
        },
        _onBindingChange: function () {
            var oView = this.getView(),
                oViewModel = this.getViewModel("objectViewModel"),
                oElementBinding = oView.getElementBinding();
            // No data for the binding
            if (!oElementBinding.getBoundContext()) {
                this.getRouter().getTargets().display("notFound");
                return;
            }
        },
        handleToAllPOBreadcrumPress: function (oEvent) {
            history.go(-1);
        },
        onBeforeRebindTreeTable: function (oEvent) {
            var mBindingParams = oEvent.getParameter("bindingParams");
            mBindingParams.parameters["expand"] = "IssuedMaterialBOQ";
            mBindingParams.parameters["navigation"] = { "IssuedMaterialParentSet": "IssuedMaterialBOQ" };
            mBindingParams.filters.push(new sap.ui.model.Filter("SONumberId/ID", sap.ui.model.FilterOperator.EQ, this.sObjectId));
        },
        onBeforeRebindRestTable: function (oEvent) {
            var mBindingParams = oEvent.getParameter("bindingParams");
            mBindingParams.filters.push(new Filter("SONumberId/ID", sap.ui.model.FilterOperator.EQ, this.sObjectId));
            mBindingParams.sorter.push(new sap.ui.model.Sorter("CreatedAt", true));
        },
        onPressSubmitConsumptionPosting: function (oEvent) {
            var that = this;
            var ConsumptionPostingReserveId = this.sObjectId;
            var itemData = this.getTableItems();
            MessageBox.confirm("Do you want to Submit the consumption request?", {
                icon: MessageBox.Icon.INFORMATION,
                title: "Confirm",
                actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                emphasizedAction: MessageBox.Action.YES,
                onClose: function (oAction) {
                    if (oAction == "YES") {
                        that.onSubmitButtonConfirmPress(ConsumptionPostingReserveId, itemData);
                    }
                }
            });
        },
        getTableItems: function () {
            var itemData = this.getViewModel("consumptionData").getData();
            var IsAllItemsConsumed = "";
            var totalItems = itemData.filter(function (item) {
                return (item.Status === "RESERVED FOR CONSUMPTION" || item.Status === "CONSUMPTION RESERVATION FAILED");
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
        onSelectAll: function (oeve) {
            var isSelected = oeve.getSource().getSelected();
            var ItemData = this.getView().getModel("consumptionData").getData();
              var totalItems = ItemData.filter(function (item) {
                return (item.Status === "RESERVED FOR CONSUMPTION" || item.Status === "CONSUMPTION RESERVATION FAILED");
            });
            if (isSelected) {
                for (var i = 0; i < totalItems.length; i++) {
                    totalItems[i].isSelected = true;
                }
            }
            else {
                for (var i = 0; i < ItemData.length; i++) {
                    totalItems[i].isSelected = false;
                }
            }
            this.getView().getModel("consumptionData").setData(totalItems);
        },
        onSubmitButtonConfirmPress: function (CID, itemData) {
            var IsAllItemsConsumed = itemData.IsAllItemsConsumed;
            itemData = itemData.selectedItems.map(function (item) {
                return {
                    ConsumedMaterialReserveItemId: item.ID,
                    Quantity: item.Quantity
                };
            });
            var oPayload =
            {
                "UserName": "Agel",
                "ConsumptionPostingReserveId": CID,
                "IsAllItemsConsumed": IsAllItemsConsumed,
                "ParentItem": itemData
            };
            this.MainModel.create("/ConsumptionPostingEdmSet", oPayload, {
                success: function (oData, oResponse) {
                    if (oData.Success === true) {
                        sap.m.MessageBox.success("Cosumption Posted with Material Document Number " + "" + oData.MaterialDocumentNumber + "" + " Succesfully created!", {
                            title: "Success",
                            onClose: function (oAction1) {
                                if (oAction1 === sap.m.MessageBox.Action.OK) {
                                    this.handleToAllPOBreadcrumPress();
                                    this.MainModel.refresh();
                                }
                            }.bind(this)
                        });
                    }
                    else {
                        sap.m.MessageBox.error(oData.Message);
                    }
                }.bind(this),
                error: function (oError) {
                    sap.m.MessageBox.error(oError.Message);
                }
            });
        }
    });
});