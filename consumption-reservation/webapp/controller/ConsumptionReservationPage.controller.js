sap.ui.define([
    "./BaseController",
    "sap/ui/core/Fragment",
    "sap/ui/Device",
    "sap/ui/model/json/JSONModel",
    'sap/m/Token',
    'sap/m/ColumnListItem',
    'sap/m/Label',
    'sap/m/MessageBox',
    '../utils/formatter',
    'sap/m/MessageToast'
],
    function (BaseController, Fragment, Device, JSONModel, Token, ColumnListItem, Label, MessageBox, formatter, MessageToast) {
        "use strict";
        return BaseController.extend("com.agel.mmts.consumptionreservation.controller.ConsumptionReservationPage", {
            formatter: formatter,
            onInit: function () {
                //jQuery.sap.addUrlWhitelist("blob");
                this.mainModel = this.getOwnerComponent().getModel();
                this.mainModel.setSizeLimit(1000);
                //Router Object
                this.oRouter = this.getOwnerComponent().getRouter();
                //view model instatiation
                this.createInitialModel();
                this._createHeaderDetailsModel();
                this._createItemDataModel();
            },
            createInitialModel: function () {
                var oViewModel = new JSONModel({
                    busy: false,
                    delay: 0,
                    isButtonVisible: true,
                    isHeaderFieldsVisible: false
                });
                this.setModel(oViewModel, "objectViewModel");
            },
            _createHeaderDetailsModel: function () {
                var oModel = new JSONModel({
                    movementType: [
                        {
                            value: "201",
                            Text: "201 - Consumption Reservation"
                        }
                    ],
                    MovementTypeValue: null,
                    WBS: null,
                    GoodRecipient: null,
                    Plant: null,
                    RecievingLocation: null,
                    CostCenter: null,
                    GLAccount: null
                });
                this.getView().setModel(oModel, "HeaderDetailsModel")
            },
            _createItemDataModel: function () {
                var oModel = new JSONModel([]);
                this.getView().setModel(oModel, "reservationTableModel");
            },
            onSearchGoodReciepient: function (sGoodsReciepientValue) {
                var GoodReciepientFilter = new sap.ui.model.Filter({
                    path: "GoodsRecipient",
                    operator: sap.ui.model.FilterOperator.EQ,
                    value1: sGoodsReciepientValue
                });
                var filter = [];
                filter.push(GoodReciepientFilter);
                this.getOwnerComponent().getModel().read("/IssuedMaterialReserveSet", {
                    filters: [filter],
                    urlParameters: {
                        "$expand": "IssuedMaterials/IssuedMaterialParents"
                    },
                    success: function (oData, oResponse) {
                        this.dataBuilding(oData.results);
                        this.getViewModel("objectViewModel").setProperty("/isItemFieldsVisible", true);
                        this.getViewModel("objectViewModel").setProperty("/isButtonVisible", false);
                    }.bind(this),
                    error: function (oError) {
                        sap.m.MessageBox.error(JSON.stringify(oError));
                    }
                });
            },
            dataBuilding: function (ParentData) {
                for (var i = 0; i < ParentData.length; i++) {
                    ParentData[i].results = ParentData[i].IssuedMaterials.results;
                    for (var j = 0; j < ParentData[i].IssuedMaterials.results.length; j++) {
                        ParentData[i].IssuedMaterials.results[j].results = ParentData[i].IssuedMaterials.results[j].IssuedMaterialParents.results;
                        ParentData[i].IssuedMaterials.results[j].isParent = false;
                        ParentData[i].IssuedMaterials.results[j].isSelected = false;
                        for (var k = 0; k < ParentData[i].IssuedMaterials.results[j].IssuedMaterialParents.results.length; k++) {
                            if (ParentData[i].IssuedMaterials.results[j].IssuedMaterialParents.results[k].Status === "ISSUED")
                                ParentData[i].IssuedMaterials.results[j].IssuedMaterialParents.results[k].isParent = true;
                        }
                    }
                    ParentData[i].isParent = false;
                    ParentData[i].isSelected = false;
                }
                var TreeDataModel = new JSONModel({ "results": ParentData });
                this.getView().setModel(TreeDataModel, "TreeDataModel");
                var data = this.ChildData;
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
            onAddReservationItemsPress: function (oEvent) {
                var oModel = this.getViewModel("reservationTableModel");
                var oItems = oModel.getData().map(function (oItem) {
                    return Object.assign({}, oItem);
                });
                oItems.push({
                    MaterialCode: "",
                    MaterialName: "",
                    Qty: "",
                    BaseUnit: ""
                });
                oModel.setData(oItems);
            },
            onMaterialCodeChange: function (oEvent) {
                var reservationListObj = oEvent.getParameter("selectedRow").getBindingContext().getObject();
                var sItemPath = oEvent.getSource().getParent().getBindingContextPath();
                this.getView().getModel("reservationTableModel").setProperty(sItemPath + "/MaterialName", reservationListObj.Description);
                this.getView().getModel("reservationTableModel").setProperty(sItemPath + "/BaseUnit", reservationListObj.UOM);
                this.getView().getModel("reservationTableModel").setProperty(sItemPath + "/MaterialCode", reservationListObj.MaterialCode);
            },
            onLiveChangeReservedQty: function (oEvent) {
                var rowObj = oEvent.getSource().getParent().getRowBindingContext().getObject();
                var ReservedQty = oEvent.getSource().getParent().getCells()[10].getValue();
                var aCell = oEvent.getSource().getParent().getCells()[10];

                if (ReservedQty === "") {
                    aCell.setValueState("Error");
                    aCell.setValueStateText("Please enter quantity ")
                    this.getView().byId("idBtnSave").setEnabled(false);
                }

                else if (parseInt(ReservedQty) < 0) {
                    aCell.setValueState("Error");
                    aCell.setValueStateText("Please enter quantity greater than 0 or positive value")
                    this.getView().byId("idBtnSave").setEnabled(false);
                }
                else if (parseInt(ReservedQty) > parseInt(rowObj.BalanceQty)) {
                    aCell.setValueState("Error");
                    aCell.setValueStateText("Please enter quantity lesser than or equal to balance quantity")
                    this.getView().byId("idBtnSave").setEnabled(false);
                }
                else {
                    aCell.setValueState("None");
                    this.getView().byId("idBtnSave").setEnabled(true);
                }
            },
            onPressGo: function () {
                var oHeaderData = this.getViewModel("HeaderDetailsModel").getData();
                var aReservationItems = this.getViewModel("reservationTableModel").getData();
                if (!this._validateHeaderData(oHeaderData)) {
                    return;
                }
                this.onSearchGoodReciepient(oHeaderData.GoodRecipient);
                // if (!this._validateItemData(aReservationItems)) {
                //     return;
                // }
            },
            onSubmitReservation: function (oEvent) {
                this._handleMessageBoxForReservationList("Do you want to submit these Reservation items?");
            },
            onCancelReservation: function () {
                this._handleMessageBoxForCancelReservation("Do you want to cancel these Reservation items?");
            },
            _handleMessageBoxForReservationList: function (sMessage) {
                var that = this;
                sap.m.MessageBox.confirm(sMessage, {
                    icon: MessageBox.Icon.INFORMATION,
                    title: "Confirm",
                    actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                    emphasizedAction: MessageBox.Action.YES,
                    onClose: function (oAction) {
                        if (oAction == "YES") {
                            that._createReservationList();
                        }
                    }
                });
            },
            _handleMessageBoxForCancelReservation: function (sMessage) {
                var that = this;
                sap.m.MessageBox.confirm(sMessage, {
                    icon: MessageBox.Icon.INFORMATION,
                    title: "Confirm",
                    actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                    emphasizedAction: MessageBox.Action.YES,
                    onClose: function (oAction) {
                        if (oAction == "YES") {
                            that.setInitialModel();
                        }
                    }
                });
            },
            _validateHeaderData: function (data) {
                var bValid = true;
                if (!data.GoodRecipient) {
                    this.byId("idGoodReciept").setValueState("Error");
                    this.byId("idGoodReciept").setValueStateText("Please enter goods recipient");
                    bValid = false;
                } else {
                    this.byId("idGoodReciept").setValueState("None");
                    this.byId("idGoodReciept").setValueStateText(null);
                }
                if (!data.Plant) {
                    this.byId("idSelPlant").setValueState("Error");
                    this.byId("idSelPlant").setValueStateText("Please enter plant value");
                    bValid = false;
                } else {
                    this.byId("idSelPlant").setValueState("None");
                    this.byId("idSelPlant").setValueStateText(null);
                    this.getViewModel("objectViewModel").setProperty("/isHeaderFieldsVisible", true);
                }

                if (!data.ProfitCenter) {
                    this.byId("idProfitCenter").setValueState("Error");
                    this.byId("idProfitCenter").setValueStateText("Please enter profit center value");
                    bValid = false;
                } else {
                    this.byId("idProfitCenter").setValueState("None");
                    this.byId("idProfitCenter").setValueStateText(null);
                }
                if (!data.CostCenter) {
                    this.byId("idCostCenter").setValueState("Error");
                    this.byId("idCostCenter").setValueStateText("Please enter cost center value");
                    bValid = false;
                } else {
                    this.byId("idCostCenter").setValueState("None");
                    this.byId("idCostCenter").setValueStateText(null);
                }
                if (!data.WBS) {
                    this.byId("idWBS").setValueState("Error");
                    this.byId("idWBS").setValueStateText("Please enter WBS value");
                    bValid = false;
                } else {
                    this.byId("idWBS").setValueState("None");
                    this.byId("idWBS").setValueStateText(null);
                }
                if (!data.GLAccount) {
                    this.byId("idGLAccount").setValueState("Error");
                    this.byId("idGLAccount").setValueStateText("Please enter GLAccount recipient");
                    bValid = false;
                } else {
                    this.byId("idGLAccount").setValueState("None");
                    this.byId("idGLAccount").setValueStateText(null);
                }
                return bValid;
            },
            _validateItemData: function (itemData) {
                var bValid = true;
                if (itemData.length > 0) {
                    var aReservationItems = this.getView().getModel("reservationTableModel").getData();
                    for (let i = 0; i < aReservationItems.length; i++) {
                        if (!aReservationItems[i].MaterialCode) {
                            bValid = false;
                            sap.m.MessageBox.alert("Please select Material Code.");
                            return;
                        }
                        if (!aReservationItems[i].Qty) {
                            bValid = false;
                            sap.m.MessageBox.alert("Please select quanity for the material " + aReservationItems[i].MaterialCode);
                            return;
                        }
                    }
                }
                else {
                    bValid = false;
                    sap.m.MessageBox.alert("Please add atleast one item");
                }
                return bValid;
            },
            _createReservationList: function () {
                var oAdditionalData = this.getViewModel("HeaderDetailsModel").getData();
                var aTreeData = this.getViewModel("TreeDataModel").getData();
                var itemData = aTreeData.results;
                var aReservationItems = [];
                for (var i = 0; i < itemData.length; i++) {
                    for (var j = 0; j < itemData[i].IssuedMaterials.results.length; j++) {
                        for (var k = 0; k < itemData[i].IssuedMaterials.results[j].IssuedMaterialParents.results.length; k++) {
                            if (itemData[i].IssuedMaterials.results[j].IssuedMaterialParents.results[k].isSelected === true) {
                                aReservationItems.push(itemData[i].IssuedMaterials.results[j].IssuedMaterialParents.results[k]);
                            }
                        }
                    }
                }
                this.callConsumptionReservationService(oAdditionalData, aReservationItems);
            },
            callConsumptionReservationService: function (oAdditionalData, aReservationItems) {
                aReservationItems = aReservationItems.map(function (item) {
                    return {
                        Quantity: item.Quantity,
                        IssueMaterialParentId: item.ID
                    };
                });
                var oPayload = {
                    "UserName": "Agel",
                    "Plant": oAdditionalData.Plant,
                    "MovementType": "201",
                    "GoodRecipient": oAdditionalData.GoodRecipient,
                    "CostCenter": oAdditionalData.CostCenter,
                    "WBS": "",
                    "GLAccount": oAdditionalData.GLAccount,
                    "ProfitCenter": oAdditionalData.ProfitCenter,
                    "ParentItem": aReservationItems
                };
                this.mainModel.create("/ConsumptionPostingReserveEdmSet", oPayload, {
                    success: function (oData, oResponse) {
                        if (oData.Success === true) {
                            this.getView().getModel();
                            sap.m.MessageBox.success("The consumption reservation " + "" + oData.ReservationNumber + "" + " has been succesfully created for selected Items!");
                            this.setInitialModel();
                            var objectViewModel = this.getViewModel("objectViewModel");
                        }
                        else {
                            sap.m.MessageBox.error(oData.Message);
                        }
                    }.bind(this),
                    error: function (oError) {
                        // sap.m.MessageBox.success("Something went Wrong!");
                        var objectViewModel = this.getViewModel("objectViewModel");
                        // objectViewModel.setProperty("/isViewQRMode", false);
                    }.bind(this)
                })
            },
            onPressReset: function () {
                this.setInitialModel();
                this.byId("idPlant").setEnabled(true);
                this.byId("idStorageLocation").setEnabled(true);
            },
            setInitialModel: function () {
                this._createHeaderDetailsModel();
                this._createItemDataModel();
                this.createInitialModel();
            }
        });
    });
