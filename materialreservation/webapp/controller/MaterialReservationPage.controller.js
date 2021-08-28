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
                        key: "0",
                        value: ""
                    },
                    {
                        key: "1",
                        value: "311"
                    },
                    {
                        key: "2",
                        value: "201"
                    },
                    {
                        key: "3",
                        value: "211"
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
                var sMovementType = oEvent.getSource()._getSelectedItemText();
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
            },
            onSubmitReservation: function (oEvent) {
                var oHeaderData = this.getViewModel("HeaderDetailsModel").getData();
                if (!this._validateData(oHeaderData)) {
                    return;
                }
                this._handleMessageBoxForReservationList("Do you want to Submit these Reservation items?");
                debugger;
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
                    case "201":
                        this.callIssueReservationService(oAdditionalData, aReservationItems);
                        break;
                    case "221":
                        this.callIssueReservationService();
                        break;
                    case "222":
                        this.callIssueReservationService();
                        break;
                    case "311":
                        this.callIssueReservationService();
                        break;
                    case "312":
                        this.callIssueReservationService();
                        break;
                }
            },
            callIssueReservationService: function (oAdditionalData, aReservationItems) {
                var oPayload = {
                    "PlantCode": "4500327851",
                    "GoodsRecipient": "4600327831",
                    "ReceivingLocation": "Pune",
                    "GLAccount": "12345",
                    "IssueMaterialReservationParents": [
                        {
                            "ParentMaterialCode": "6781438673",
                            "Quantity": 10
                        }
                    ]
                };
                // oPayload.PackingListId = oBindingContextData.ID;
                this.mainModel.create("/IssueMaterialReservationEdmSet", oPayload, {
                    success: function (oData, oResponse) {
                        this.getView().getModel();
                        sap.m.MessageBox.success("The Reservation Items are Saved Successfully!");
                        var objectViewModel = this.getViewModel("objectViewModel");
                        // objectViewModel.setProperty("/isPackingListInEditMode", false);
                        // objectViewModel.setProperty("/isViewQRMode", true);
                    }.bind(this),
                    error: function (oError) {
                        sap.m.MessageBox.success("Something went Wrong!");
                        var objectViewModel = this.getViewModel("objectViewModel");
                        // objectViewModel.setProperty("/isPackingListInEditMode", false);
                        // objectViewModel.setProperty("/isViewQRMode", false);
                    }.bind(this)
                })
            }
        });
    });
