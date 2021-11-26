sap.ui.define(
    [
        "./BaseController",
        "sap/ui/core/Fragment",
        "sap/ui/Device",
        "sap/ui/model/json/JSONModel",
        "sap/m/Token",
        "sap/m/ColumnListItem",
        "sap/m/Label",
        "sap/m/MessageBox",
        "../utils/formatter",
        "sap/m/MessageToast",
    ],
    function (
        BaseController,
        Fragment,
        Device,
        JSONModel,
        Token,
        ColumnListItem,
        Label,
        MessageBox,
        formatter,
        MessageToast
    ) {
        "use strict";
        return BaseController.extend(
            "com.agel.mmts.consumptionreservation.controller.ConsumptionReservationPage",
            {
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
                        isHeaderFieldsVisible: false,
                    });
                    this.setModel(oViewModel, "objectViewModel");
                },
                _createHeaderDetailsModel: function () {
                    var oModel = new JSONModel({
                        movementType: [
                            {
                                value: "201",
                                Text: "201 - Consumption Reservation",
                            },
                        ],
                        MovementTypeValue: null,
                        WBS: null,
                        GoodRecipient: null,
                        Plant: null,
                        RecievingLocation: null,
                        CostCenter: null,
                        GLAccount: null,
                    });
                    this.getView().setModel(oModel, "HeaderDetailsModel");
                },
                _createItemDataModel: function () {
                    var oModel = new JSONModel([]);
                    this.getView().setModel(oModel, "reservationTableModel");
                },
                onSearchGoodReciepient: function (sGoodsReciepientValue) {
                    this.getViewModel("objectViewModel").setProperty(
                        "/busy",
                        true
                    );
                    var GoodReciepientFilter = new sap.ui.model.Filter({
                        path: "GoodsRecipient",
                        operator: sap.ui.model.FilterOperator.EQ,
                        value1: sGoodsReciepientValue,
                    });
                    var BalanceQtyFilter = new sap.ui.model.Filter({
                        path: "BalanceQty",
                        operator: sap.ui.model.FilterOperator.NE,
                        value1: 0,
                    });
                    // var IDFilter = new sap.ui.model.Filter({
                    //     path: "ID",
                    //     operator: sap.ui.model.FilterOperator.EQ,
                    //     value1: 12,
                    // });
                    var filter = [];
                    filter.push(GoodReciepientFilter, BalanceQtyFilter);
                    this.getOwnerComponent()
                        .getModel()
                        .read("/IssuedMaterialReservedItemSet", {
                            filters: [filter],
                            urlParameters: {
                                $expand: "IssuedMaterialReservedBOQItems",
                            },
                            success: function (oData, oResponse) {
                                this.dataBuilding(oData.results);
                                this.getViewModel("objectViewModel").setProperty(
                                    "/isItemFieldsVisible",
                                    true
                                );
                                this.getViewModel("objectViewModel").setProperty(
                                    "/isButtonVisible",
                                    false
                                );
                                this.getViewModel("objectViewModel").setProperty(
                                    "/busy",
                                    false
                                );
                            }.bind(this),
                            error: function (oError) {
                                // sap.m.MessageBox.error(JSON.stringify(oError.message));
                                this.getViewModel("objectViewModel").setProperty(
                                    "/busy",
                                    false
                                );
                            }.bind(this),
                        });
                },
                dataBuilding: function (ParentData) {
                    for (var i = 0; i < ParentData.length; i++) {
                        ParentData[i].results = ParentData[i].IssuedMaterialReservedBOQItems.results;
                        if (ParentData[i].BaseUnit === "MT") {
                            ParentData[i].isChildItemFreeze = false;
                            ParentData[i].Quantity = "";
                        } else {
                            ParentData[i].isChildItemFreeze = true;
                            ParentData[i].Quantity = "";
                        }
                        for (var j = 0; j < ParentData[i].IssuedMaterialReservedBOQItems.results.length; j++) {
                            if (ParentData[i].BaseUnit === "MT") {
                                ParentData[i].IssuedMaterialReservedBOQItems.results[
                                    j
                                ].isParent = true;
                                ParentData[i].isChildItemFreeze = false;
                                ParentData[i].IssuedMaterialReservedBOQItems.results[
                                    j
                                ].isChildItemFreeze = true;
                            } else {
                                ParentData[i].IssuedMaterialReservedBOQItems.results[
                                    j
                                ].isParent = true;
                                ParentData[i].isChildItemFreeze = true;
                                ParentData[i].IssuedMaterialReservedBOQItems.results[
                                    j
                                ].isChildItemFreeze = false;
                            }
                            //   ParentData[i].IssuedMaterialReservedBOQItems.results[j].isParent = true;
                            //   ParentData[i].IssuedMaterialReservedBOQItems.results[j].isSelected = false;
                        }
                        ParentData[i].isParent = false;
                        ParentData[i].isSelected = false;
                    }
                    var TreeDataModel = new JSONModel({ results: ParentData });
                    this.getView().setModel(TreeDataModel, "TreeDataModel");
                },
                // dataBuilding: function (ItemData) {
                //   for (var i = 0; i < ItemData.length; i++) {
                //     ItemData[i].isSelected = false;
                //   }
                //   var consumptionData = new JSONModel(ItemData);
                //   this.getView().setModel(consumptionData, "consumptionData");
                // },
                onSelectAll: function (oeve) {
                    var isSelected = oeve.getSource().getSelected();
                    var ItemData = this.getView().getModel("consumptionData").getData();
                    if (isSelected) {
                        for (var i = 0; i < ItemData.length; i++) {
                            ItemData[i].isSelected = true;
                        }
                    } else {
                        for (var i = 0; i < ItemData.length; i++) {
                            ItemData[i].isSelected = false;
                        }
                    }
                    this.getView().getModel("consumptionData").setData(ItemData);
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
                        BaseUnit: "",
                    });
                    oModel.setData(oItems);
                },
                onMaterialCodeChange: function (oEvent) {
                    var reservationListObj = oEvent
                        .getParameter("selectedRow")
                        .getBindingContext()
                        .getObject();
                    var sItemPath = oEvent
                        .getSource()
                        .getParent()
                        .getBindingContextPath();
                    this.getView()
                        .getModel("reservationTableModel")
                        .setProperty(
                            sItemPath + "/MaterialName",
                            reservationListObj.Description
                        );
                    this.getView()
                        .getModel("reservationTableModel")
                        .setProperty(sItemPath + "/BaseUnit", reservationListObj.UOM);
                    this.getView()
                        .getModel("reservationTableModel")
                        .setProperty(
                            sItemPath + "/MaterialCode",
                            reservationListObj.MaterialCode
                        );
                },
                onLiveChangeReservedQty: function (oEvent) {
                    var sItemPath = oEvent
                        .getSource()
                        .getBindingContext("TreeDataModel")
                        .getPath();
                    var sParentPath = sItemPath.slice(0, 10);
                    var iTotalQuantity = this.getViewModel("TreeDataModel").getProperty(
                        sParentPath + "/Quantity"
                    );
                    var iParentIssuedQuantity = this.getViewModel("TreeDataModel").getProperty(
                        sParentPath + "/IssuedQty"
                    );
                    if (!iTotalQuantity) iTotalQuantity = 0;
                    var ReservedQty = parseFloat(oEvent.getSource().getValue());
                    var oValue = oEvent.getSource().getValue();
                    if (!oValue)
                        oValue = 0;
                    var BalanceQty = parseFloat(
                        oEvent.getSource().getParent().getCells()[11].getText()
                    );
                    var bChildItemFreeze = this.getViewModel("TreeDataModel").getProperty(
                        sParentPath + "/isChildItemFreeze"
                    );
                    var aChildItems = this.getViewModel("TreeDataModel").getProperty(
                        sParentPath + "/IssuedMaterialReservedBOQItems"
                    );
                    if (bChildItemFreeze) {
                        debugger;
                        aChildItems.results.forEach((item) => {
                            // item.Quantity = parseFloat(oValue) * (parseFloat(item.IssuedQty) /parseFloat(iParentIssuedQuantity));
                            item.Quantity = parseFloat(oValue) * (parseFloat(item.BaseQty));
                        });
                        this.getViewModel("TreeDataModel").setProperty(
                            sParentPath + "/IssuedMaterialReservedBOQItems",
                            aChildItems
                        );
                    } else {
                        if (parseFloat(oValue) >= 0) {
                            var wpp = oEvent
                                .getSource()
                                .getBindingContext("TreeDataModel")
                                .getObject().WeightPerPiece;
                            var liveQty = oEvent
                                .getSource()
                                .getBindingContext("TreeDataModel")
                                .getObject().Quantity;
                            if (!liveQty) liveQty = 0;
                            iTotalQuantity = iTotalQuantity + ((parseFloat(oValue) - parseFloat(liveQty)) * parseFloat(wpp));
                            this.getViewModel("TreeDataModel").setProperty(sItemPath + "/Quantity", oValue);
                            // var sum = aChildQty.reduce((a, b) => ({
                            //   x: a.Quantity + b.Quantity,
                            // }));
                            this.getViewModel("TreeDataModel").setProperty(
                                sParentPath + "/Quantity",
                                iTotalQuantity
                            );
                        }
                    }
                    //if (oValue === "") {
                    // oEvent.getSource().setValueState("Error");
                    // oEvent.getSource().setValueStateText("Please enter quantity ");
                    // this.getView().byId("idBtnSave").setEnabled(false);
                    // } 
                    if (parseInt(ReservedQty) < 0) {
                        oEvent.getSource().setValueState("Error");
                        oEvent
                            .getSource()
                            .setValueStateText(
                                "Please enter quantity greater than 0 or positive value"
                            );
                        this.getView().byId("idBtnSave").setEnabled(false);
                    } else if (parseInt(ReservedQty) > parseInt(BalanceQty)) {
                        oEvent.getSource().setValueState("Error");
                        oEvent
                            .getSource()
                            .setValueStateText(
                                "Please enter quantity lesser than or equal to balance quantity"
                            );
                        this.getView().byId("idBtnSave").setEnabled(false);
                    } else {
                        oEvent.getSource().setValueState("None");
                        this.getView().byId("idBtnSave").setEnabled(true);
                    }
                },
                onPressGo: function () {
                    var oHeaderData = this.getViewModel("HeaderDetailsModel").getData();
                    var aReservationItems = this.getViewModel(
                        "reservationTableModel"
                    ).getData();
                    if (!this._validateHeaderData(oHeaderData)) {
                        return;
                    }
                    this.onSearchGoodReciepient(oHeaderData.GoodRecipient);
                    // if (!this._validateItemData(aReservationItems)) {
                    //     return;
                    // }
                },
                onSubmitReservation: function (oEvent) {
                    //   if (!this._validateItemData()) {
                    //     return;
                    //   }
                    this._handleMessageBoxForReservationList(
                        "Do you want to submit these Reservation items?"
                    );
                },
                onCancelReservation: function () {
                    this._handleMessageBoxForCancelReservation(
                        "Do you want to cancel these Reservation items?"
                    );
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
                        },
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
                        },
                    });
                },
                _validateHeaderData: function (data) {
                    var bValid = true;
                    if (!data.GoodRecipient) {
                        this.byId("idGoodReciept").setValueState("Error");
                        this.byId("idGoodReciept").setValueStateText(
                            "Please enter goods recipient"
                        );
                        bValid = false;
                    } else {
                        this.byId("idGoodReciept").setValueState("None");
                        this.byId("idGoodReciept").setValueStateText(null);
                    }
                    if (!data.Plant) {
                        this.byId("idSelPlant").setValueState("Error");
                        this.byId("idSelPlant").setValueStateText(
                            "Please enter plant value"
                        );
                        bValid = false;
                    } else {
                        this.byId("idSelPlant").setValueState("None");
                        this.byId("idSelPlant").setValueStateText(null);
                        this.getViewModel("objectViewModel").setProperty(
                            "/isHeaderFieldsVisible",
                            true
                        );
                    }
                    if (!data.ProfitCenter) {
                        this.byId("idProfitCenter").setValueState("Error");
                        this.byId("idProfitCenter").setValueStateText(
                            "Please enter profit center value"
                        );
                        bValid = false;
                    } else {
                        this.byId("idProfitCenter").setValueState("None");
                        this.byId("idProfitCenter").setValueStateText(null);
                    }
                    if (!data.CostCenter) {
                        this.byId("idCostCenter").setValueState("Error");
                        this.byId("idCostCenter").setValueStateText(
                            "Please enter cost center value"
                        );
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
                        this.byId("idGLAccount").setValueStateText(
                            "Please enter GLAccount recipient"
                        );
                        bValid = false;
                    } else {
                        this.byId("idGLAccount").setValueState("None");
                        this.byId("idGLAccount").setValueStateText(null);
                    }
                    return bValid;
                },
                _validateItemData: function (itemData) {
                    var bValid = true;
                    var aItemData = this.getView().getModel("TreeDataModel").getData();
                    var itemData = aItemData.results.filter(function (item) {
                        return item.isSelected === true;
                    });
                    if (itemData.length > 0) {
                        for (let i = 0; i < itemData.length; i++) {
                            if (!itemData[i].Quantity) {
                                bValid = false;
                                sap.m.MessageBox.alert(
                                    "Please select reserved quanity for the material " +
                                    itemData[i].MaterialCode
                                );
                                return;
                            }
                        }
                    }
                    if (itemData.length === 0) {
                        bValid = false;
                        sap.m.MessageBox.alert("Please select atleast one item");
                    }
                    return bValid;
                },
                _createReservationList: function () {
                    var oAdditionalData = this.getViewModel(
                        "HeaderDetailsModel"
                    ).getData();
                    var aItemData = this.getViewModel("TreeDataModel").getData();
                    //   var selectedItems = aItemData.results.filter(function (item) {
                    //     return item.isSelected === true;
                    //   });
                    var aItemData = aItemData.results;
                    this.callConsumptionReservationService(oAdditionalData, aItemData);
                },
                callConsumptionReservationService: function (
                    oAdditionalData,
                    aReservationItems
                ) {
                    
                    aReservationItems = aReservationItems.map(function (item) {
                        return {
                            IssuedMaterialReservedItemId: parseInt(item.ID),
                            Quantity: item.Quantity,
                            BoqItem: item.IssuedMaterialReservedBOQItems.results.map(
                                function (items) {
                                    return {
                                        IssuedMaterialReservedBOQItemId: parseInt(items.ID),
                                        Quantity: parseFloat(items.Quantity),
                                    };
                                }
                            ),
                        };
                    });
                    this.getViewModel("objectViewModel").setProperty(
                        "/busy",
                        true);
                    var oPayload = {
                        UserName: "Agel",
                        Plant: oAdditionalData.Plant,
                        MovementType: "201",
                        GoodRecipient: oAdditionalData.GoodRecipient,
                        CostCenter: oAdditionalData.CostCenter,
                        WBS: "",
                        GLAccount: oAdditionalData.GLAccount,
                        ProfitCenter: oAdditionalData.ProfitCenter,
                        ParentItem: aReservationItems,
                    };
                    this.mainModel.create("/ConsumptionPostingReserveEdmSet", oPayload, {
                        success: function (oData, oResponse) {
                            this.getViewModel("objectViewModel").setProperty(
                                "/busy",
                                false);
                            if (oData.Success === true) {
                                this.getView().getModel();
                                sap.m.MessageBox.success(
                                    "The consumption reservation " +
                                    "" +
                                    oData.ReservationNumber +
                                    "" +
                                    " has been succesfully created for selected Items!"
                                );
                                this.setInitialModel();
                                var objectViewModel = this.getViewModel("objectViewModel");
                            } else {
                                sap.m.MessageBox.error(oData.Message);
                            }
                        }.bind(this),
                        error: function (oError) {
                            // sap.m.MessageBox.success("Something went Wrong!");
                            var objectViewModel = this.getViewModel("objectViewModel");
                            // objectViewModel.setProperty("/isViewQRMode", false);
                            this.getViewModel("objectViewModel").setProperty(
                                "/busy",
                                false);
                        }.bind(this),
                    });
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
                },
            }
        );
    }
);
