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
                    isButtonVisible: false
                });
                this.setModel(oViewModel, "objectViewModel");
            },
            _createHeaderDetailsModel: function () {
                var oModel = new JSONModel({
                    movementType: [{
                        value: "",
                        Text: ""
                    },
                    {
                        value: "311",
                        Text: "311 - Issue Reservation"
                    },
                    {
                        value: "201",
                        Text: "201 - Consumption Reservation"
                    },
                    {
                        value: "312",
                        Text: "312 - Return Reservation"
                    }
                    ],
                    MovementTypeValue: null,
                    WBS: null,
                    GoodReciepient: null,
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

            onDeleteReservationItemPress: function (oEvent) {
                this.packingListObj = oEvent.getSource().getBindingContext("reservationTableModel").getObject();
                var iRowNumberToDelete = parseInt(oEvent.getSource().getBindingContext("reservationTableModel").getPath().slice("/".length));
                var aTableData = this.getViewModel("reservationTableModel").getProperty("/");
                aTableData.splice(iRowNumberToDelete, 1);
                this.getView().getModel("reservationTableModel").refresh();
            },
            _handleMessageBoxOpen: function (sMessage, sMessageBoxType, iRowNumberToDelete) {
                MessageBox[sMessageBoxType](sMessage, {
                    actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                    onClose: function (iRowNumberToDelete, oAction) {
                        if (oAction === MessageBox.Action.YES) {
                            this._deleteBOQRow(iRowNumberToDelete);
                        }
                    }.bind(this, iRowNumberToDelete)
                });
            },
            onMaterialCodeChange: function (oEvent) {
                var reservationListObj = oEvent.getParameter("selectedRow").getBindingContext().getObject();
                var sItemPath = oEvent.getSource().getParent().getBindingContextPath();
                this.getView().getModel("reservationTableModel").setProperty(sItemPath + "/MaterialName", reservationListObj.Description);
                this.getView().getModel("reservationTableModel").setProperty(sItemPath + "/BaseUnit", reservationListObj.UOM);
                this.getView().getModel("reservationTableModel").setProperty(sItemPath + "/MaterialCode", reservationListObj.MaterialCode);
            },

            onPressGo: function () {
                var oHeaderData = this.getViewModel("HeaderDetailsModel").getData();
                var aReservationItems = this.getViewModel("reservationTableModel").getData();
                if (!this._validateHeaderData(oHeaderData)) {
                    return;
                }
                if (!this._validateItemData(aReservationItems)) {
                    return;
                }


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
                var sMovementType = this.byId("idSelMovementType").getSelectedKey();
                switch (sMovementType) {
                    case "311":
                        if (!data.CostCenter) {
                            this.byId("idCostCenter").setValueState("Error");
                            this.byId("idCostCenter").setValueStateText("Please enter cost value");
                            bValid = false;
                        } else {
                            this.byId("idCostCenter").setValueState("None");
                            this.byId("idCostCenter").setValueStateText(null);
                        }
                        break;
                    case "201":
                        if (!data.WBS) {
                            this.byId("idWBS").setValueState("Error");
                            this.byId("idWBS").setValueStateText("Please enter cost value");
                            bValid = false;
                        } else {
                            this.byId("idWBS").setValueState("None");
                            this.byId("idWBS").setValueStateText(null);
                        }
                        break;
                    case "312":
                        if (!data.RecievingLocation) {
                            this.byId("idRecievingLocation").setValueState("Error");
                            this.byId("idRecievingLocation").setValueStateText("Please enter cost value");
                            bValid = false;
                        } else {
                            this.byId("idRecievingLocation").setValueState("None");
                            this.byId("idRecievingLocation").setValueStateText(null);
                        }
                        break;
                    default:
                }
                if (!data.Plant) {
                    this.byId("idPlant").setValueState("Error");
                    this.byId("idPlant").setValueStateText("Please enter plant value");
                    bValid = false;
                } else {
                    this.byId("idPlant").setValueState("None");
                    this.byId("idPlant").setValueStateText(null);
                }
                if (!data.GoodReciepient) {
                    this.byId("idGoodReciept").setValueState("Error");
                    this.byId("idGoodReciept").setValueStateText("Please enter goods recipient");
                    bValid = false;
                } else {
                    this.byId("idGoodReciept").setValueState("None");
                    this.byId("idGoodReciept").setValueStateText(null);
                }
                if (!data.GLAccount) {
                    this.byId("idGLAccount").setValueState("Error");
                    this.byId("idGLAccount").setValueStateText("Please enter goods recipient");
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
                var aReservationItems = this.getViewModel("reservationTableModel").getData();
             this.callConsumptionReservationService(oAdditionalData, aReservationItems);
            },
          
            callConsumptionReservationService: function (oAdditionalData, aReservationItems) {
                aReservationItems = aReservationItems.map(function (item) {
                    return {
                        ItemNumber: "",
                        Material: item.MaterialCode,
                        StorageLocation: "",
                        Quantity: parseInt(item.Qty),
                        BaseUnit: item.BaseUnit,
                        Batch: ""
                    };
                });
                var oPayload = {
                    "UserName": "Agel",
                    "Plant": oAdditionalData.Plant,
                    "MovementType": oAdditionalData.MovementTypeValue,
                    "CostCenter": oAdditionalData.CostCenter,
                    "GoodRecipient": oAdditionalData.GoodReciepient,
                    "WBS": "",
                    "GLAccount": oAdditionalData.GLAccount,
                    "ProfitCenter": "",
                    "ReservationDate": "2021-01-20",
                    "ParentItem": aReservationItems
                };
                this.mainModel.create("/ConsumptionPostingReserveEdmSet", oPayload, {
                    success: function (oData, oResponse) {
                        if (oData.Success === true) {
                            this.getView().getModel();
                            sap.m.MessageBox.success("The reservation has been succesfully created for selected Items!");
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
          
            setInitialModel: function () {
                this._createHeaderDetailsModel();
                this._createItemDataModel();
                this.createInitialModel();
            }
        });
    });
