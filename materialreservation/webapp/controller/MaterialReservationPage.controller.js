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
                    isPackagingTableVisible: false,
                    isPackingListInEditMode: false,
                    isOuterPackagingRequired: true,
                    isViewQRMode: false
                });
                this.setModel(oViewModel, "objectViewModel");
                this._createHeaderDetailsModel();
                this._createItemDataModel();
            },
            _createHeaderDetailsModel: function () {
                var oModel = new JSONModel({
                    movementType: [{
                        key: "0",
                        value: "201"
                    },
                    {
                        key: "1",
                        value: "221"
                    },
                    {
                        key: "2",
                        value: "222"
                    },
                    {
                        key: "3",
                        value: "311"
                    },
                    {
                        key: "4",
                        value: "312"
                    }
                    ],
                    MovementTypeValue: null,
                    WBS: null,
                    ProfitCenter: null,
                    GoodReciepient: null,
                    Plant: null,
                    RecievingLocation: null,
                    ReservationDate: null,
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
                    ItemNo: "",
                    MaterialCode: "",
                    MaterialName: "",
                    StorageLocation: "",
                    Qty: "",
                    BaseUnit: "",
                    Batch: ""
                });
                oModel.setData(oItems);
            },
            onDeleteOuterPackingListItemPress: function (oEvent) {
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
            _deleteBOQRow: function (iRowNumberToDelete) {
                if (this.packingListObj.ID)
                    this._deleteFromDB(this.packingListObj.ID);
                var aTableData = this.getViewModel("reservationTableModel").getData();
                aTableData.splice(iRowNumberToDelete, 1);
                this.getView().getModel("reservationTableModel").refresh();
            },
            onMaterialCodeChange: function (oEvent) {
                //this.getViewModel("UOMSuggestionModel").setData(null);
                var packingListObj = oEvent.getParameter("selectedItem").getBindingContext().getObject(),
                    oBindingContext = oEvent.getParameter("selectedItem").getBindingContext(),
                    oBindingContextPath = oEvent.getSource().getSelectedItem().getBindingContext().getPath(),
                    aRowCells = oEvent.getSource().getParent().getCells(),
                    sItemPath = oEvent.getSource().getBindingContext("reservationTableModel").getPath();
                var sText = oEvent.getParameter("selectedItem").getText();
                var sKey = oEvent.getParameter("selectedItem").getKey();
                // for (var i = 1; i < aRowCells.length; i++) {
                //     if (aRowCells[i] instanceof sap.m.Text) {
                //         var cellContextPath = aRowCells[i].data("p");
                //         var val = packingListObj[cellContextPath];
                //         aRowCells[i].setText(val);
                //     }
                // }
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
