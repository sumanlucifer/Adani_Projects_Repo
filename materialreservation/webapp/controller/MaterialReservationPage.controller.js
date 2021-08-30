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
        return BaseController.extend("com.agel.mmts.materialreservation.controller.MaterialReservationPage", {
            formatter: formatter,
            onInit: function () {
                //jQuery.sap.addUrlWhitelist("blob");
                this.mainModel = this.getOwnerComponent().getModel();
                //Router Object
                this.oRouter = this.getOwnerComponent().getRouter();
                //view model instatiation
                var oViewModel = new JSONModel({
                    busy: false,
                    delay: 0,
                    isHeaderFieldsVisible: false,
                    isItemFieldsVisible: false,
                    isMovementType1Visible: false,
                    isMovementType2Visible: false,
                    isMovementType3Visible: false,
                    isButtonVisible: false
                });
                this.setModel(oViewModel, "objectViewModel");
                this._createHeaderDetailsModel();
                this._createItemDataModel();
            },
            _createHeaderDetailsModel: function () {
                var oModel = new JSONModel({
                    movementType: [{
                        value: "",
                        Text: ""
                    },
                    {
                        value: "311",
                        Text: "Issue-Reservation"
                    },
                    {
                        value: "201",
                        Text: "Consumption-Reservation"
                    },
                    {
                        value: "312",
                        Text: "Return-Reservation"
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
            onMoventTypeChange: function (oEvent) {
                var sMovementType = oEvent.getSource().getSelectedKey();
                switch (sMovementType) {
                    case "":
                        this.getViewModel("objectViewModel").setProperty("/isItemFieldsVisible", false);
                        this.getViewModel("objectViewModel").setProperty("/isMovementType1Visible", false);
                        this.getViewModel("objectViewModel").setProperty("/isMovementType2Visible", false);
                        break;
                    case "201":
                        this.getViewModel("objectViewModel").setProperty("/isItemFieldsVisible", true);
                        this.getViewModel("objectViewModel").setProperty("/isMovementType1Visible", true);
                        this.getViewModel("objectViewModel").setProperty("/isMovementType2Visible", false);
                        break;
                    case "221":
                        this.getViewModel("objectViewModel").setProperty("/isItemFieldsVisible", true);
                        this.getViewModel("objectViewModel").setProperty("/isMovementType1Visible", false);
                        this.getViewModel("objectViewModel").setProperty("/isMovementType2Visible", true);
                        break;
                    case "222":
                        this.getViewModel("objectViewModel").setProperty("/isItemFieldsVisible", true);
                        break;
                    case "311":
                        this.getViewModel("objectViewModel").setProperty("/isItemFieldsVisible", true);
                        break;
                    case "312":
                        this.getViewModel("objectViewModel").setProperty("/isItemFieldsVisible", true);
                        break;
                }
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
            onSubmitReservation: function (oEvent) {
                var oHeaderData = this.getViewModel("HeaderDetailsModel").getData();
                if (!this._validateData(oHeaderData)) {
                    return;
                }
                this._handleMessageBoxForReservationList("Do you want to Submit these Reservation items?");
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
            _validateData: function (data) {
                var bValid = true;
                if (!data.MovementTypeValue) {
                    this.byId("idSelMovementType").setValueState("Error");
                    this.byId("idSelMovementType").setValueStateText("Please select Movement Type");
                    bValid = false;
                } else {
                    this.byId("idSelMovementType").setValueState("None");
                    this.byId("idSelMovementType").setValueStateText(null);
                }
                // if (!data.InvoiceNumber) {
                //     bValid = false;
                //     sap.m.MessageBox.alert("Please enter the Invoice Number before viewing the QR.");
                //     return;
                // }
                return bValid;
            },
            _createReservationList: function () {
                var oAdditionalData = this.getViewModel("HeaderDetailsModel").getData();
                var aReservationItems = this.getViewModel("reservationTableModel").getData();
                switch (oAdditionalData.MovementTypeValue) {
                    case "311":
                        this.callIssueReservationService(oAdditionalData, aReservationItems);
                        break;
                    case "201":
                        this.callConsumptionReservationService(oAdditionalData, aReservationItems);
                        break;
                    case "312":
                        this.callReturnReservationService(oAdditionalData, aReservationItems);
                        break;
                }
            },
            callIssueReservationService: function (oAdditionalData, aReservationItems) {
                aReservationItems = aReservationItems.map(function (item) {
                    return {
                        ParentMaterialCode: item.MaterialCode,
                        Quantity: item.Qty
                    };
                });
                var oPayload = {
                    "PlantCode": oAdditionalData.Plant,
                    "GoodsRecipient": oAdditionalData.GoodReciepient,
                    "ReceivingLocation": oAdditionalData.RecievingLocation,
                    "GLAccount": oAdditionalData.GLAccount,
                    "IssueMaterialReservationParents": aReservationItems
                };
                this.mainModel.create("/IssueMaterialReservationEdmSet", oPayload, {
                    success: function (oData, oResponse) {
                        this.getView().getModel();
                        sap.m.MessageBox.success("The Items Requested are Reserved Successfully!");
                        var objectViewModel = this.getViewModel("objectViewModel");
                        // objectViewModel.setProperty("/isViewQRMode", true);
                    }.bind(this),
                    error: function (oError) {
                        // sap.m.MessageBox.success("Something went Wrong!");
                        var objectViewModel = this.getViewModel("objectViewModel");
                        // objectViewModel.setProperty("/isViewQRMode", false);
                    }.bind(this)
                })
            },
            callConsumptionReservationService: function (oAdditionalData, aReservationItems) {
                aReservationItems = aReservationItems.map(function (item) {
                    return {
                        ItemNumber: "",
                        Material: item.MaterialCode,
                        StorageLocation: item.MaterialCode,
                        Quantity: item.Qty,
                        BaseUnit: item.BaseUnit,
                        Batch: ""
                    };
                });
                var oPayload = {
                    "UserName": "Agel",
                    "Plant": oAdditionalData.Plant,
                    "MovementType": oAdditionalData.value,
                    "CostCenter": oAdditionalData.CostCenter,
                    "WBS": oAdditionalData.WBS,
                    "GLAccount": oAdditionalData.GLAccount,
                    "ProfitCenter": "",
                    "ReservationDate": "",
                    "ParentItem": aReservationItems
                };
                this.mainModel.create("/ConsumptionPostingReserveEdmSet", oPayload, {
                    success: function (oData, oResponse) {
                        this.getView().getModel();
                        sap.m.MessageBox.success("The Items Requested are Consumed Successfully!");
                        var objectViewModel = this.getViewModel("objectViewModel");
                        // objectViewModel.setProperty("/isViewQRMode", true);
                    }.bind(this),
                    error: function (oError) {
                        // sap.m.MessageBox.success("Something went Wrong!");
                        var objectViewModel = this.getViewModel("objectViewModel");
                        // objectViewModel.setProperty("/isViewQRMode", false);
                    }.bind(this)
                })
            },
            callReturnReservationService: function (oAdditionalData, aReservationItems) {
                aReservationItems = aReservationItems.map(function (item) {
                    return {
                        ItemNumber: "",
                        Material: item.MaterialCode,
                        StorageLocation: item.MaterialCode,
                        Quantity: item.Qty,
                        BaseUnit: item.BaseUnit,
                        Batch: ""
                    };
                });
                var oPayload = {
                    "UserName": "Agel",
                    "Plant": "PL-01",
                    "MovementType": oAdditionalData.value,
                    "GoodRecipient": oAdditionalData.GoodReciepient,
                    "CostCenter": oAdditionalData.CostCenter,
                    "WBS": oAdditionalData.WBS,
                    "GLAccount": oAdditionalData.GLAccount,
                    "ProfitCenter": "",
                    "ReservationDate": "",
                    "ParentList": aReservationItems
                };
                this.mainModel.create("/ReturnMaterialReserveEdmSet", oPayload, {
                    success: function (oData, oResponse) {
                        this.getView().getModel();
                        sap.m.MessageBox.success("The Items Requested are Returned Successfully!");
                        var objectViewModel = this.getViewModel("objectViewModel");
                        // objectViewModel.setProperty("/isViewQRMode", true);
                    }.bind(this),
                    error: function (oError) {
                        // sap.m.MessageBox.success("Something went Wrong!");
                        var objectViewModel = this.getViewModel("objectViewModel");
                        // objectViewModel.setProperty("/isViewQRMode", false);
                    }.bind(this)
                })
            }
        });
    });
