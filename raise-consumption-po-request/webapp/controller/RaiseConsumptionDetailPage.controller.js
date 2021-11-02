sap.ui.define(
    [
        "./BaseController",
        "sap/ui/model/json/JSONModel",
        "sap/ui/model/Filter",
        "sap/ui/model/FilterOperator",
        "sap/ui/core/Fragment",
        "sap/ui/model/Sorter",
        "sap/ui/Device",
        "sap/ui/core/routing/History",
        "sap/m/ColumnListItem",
        "sap/m/Input",
        "sap/base/util/deepExtend",
        "sap/ui/export/Spreadsheet",
        "sap/m/MessageToast",
        "sap/m/MessageBox",
        "sap/m/ObjectIdentifier",
        "sap/m/Text",
        "sap/m/Button",
        "sap/m/Dialog",
        "../utils/formatter",
    ],
    function (
        BaseController,
        JSONModel,
        Filter,
        FilterOperator,
        Fragment,
        Sorter,
        Device,
        History,
        ColumnListItem,
        Input,
        deepExtend,
        Spreadsheet,
        MessageToast,
        MessageBox,
        ObjectIdentifier,
        Text,
        Button,
        Dialog,
        formatter
    ) {
        "use strict";
        return BaseController.extend(
            "com.agel.mmts.raiseconsumptionporequest.controller.RaiseConsumptionDetailPage",
            {
                formatter: formatter,
                onInit: function () {
                    this.getView().addEventDelegate(
                        {
                            onAfterShow: this.onBeforeShow,
                        },
                        this
                    );
                    //view model instatiation
                    var oViewModel = new JSONModel({
                        busy: false,
                        delay: 0,
                        boqSelection: null,
                        csvFile: "file",
                    });
                    this.setModel(oViewModel, "objectViewModel");
                    var oReservationData = new JSONModel({
                        ReservationNumber: null,
                        ReservationDate: null,
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
                    this.oRouter
                        .getRoute("RouteReturnConsumptionDetailPage")
                        .attachPatternMatched(this._onObjectMatched, this);
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
                            // change: this._onBindingChange.bind(that),
                            dataRequested: function () {
                                objectViewModel.setProperty("/busy", true);
                            },
                            dataReceived: function () {
                                objectViewModel.setProperty("/busy", false);
                                that.onReadDataIssueMaterialParents();
                            },
                        },
                    });
                },
                onReadDataIssueMaterialParents: function () {
                    var that = this;
                    that.oIssueMaterialModel = new JSONModel();
                    this.MainModel.read(
                        "/ConsumptionPostingReserveSet(" +
                        that.sObjectId +
                        ")/ConsumedMaterialReserveItem",
                        {
                            urlParameters: { "$expand": "ConsumedMaterialReserveBOQItem" },
                            success: function (oData, oResponse) {



                                this.dataBuilding(oData.results);
                                //          var consumptionData = new JSONModel(oData.results);
                                // this.getView().setModel(consumptionData, "consumptionData");
                            }.bind(this),
                            error: function (oError) {
                                sap.m.MessageBox.error("Data Not Found");
                            },
                        }
                    );
                },
                dataBuilding: function (ParentData) {
                    for (var i = 0; i < ParentData.length; i++) {
                        ParentData[i].results =
                            ParentData[i].ConsumedMaterialReserveBOQItem.results;
                        for (var j = 0; j < ParentData[i].ConsumedMaterialReserveBOQItem.results.length; j++) {
                            if (ParentData[i].BaseUnit === "MT") {
                                ParentData[i].ConsumedMaterialReserveBOQItem.results[j].isParent = true;
                                ParentData[i].ConsumedMaterialReserveBOQItem.results[j].Quantity = "";
                                ParentData[i].isChildItemFreeze = false;
                                ParentData[i].ConsumedMaterialReserveBOQItem.results[j].isChildItemFreeze = true;
                            } else {
                                ParentData[i].ConsumedMaterialReserveBOQItem.results[j].isParent = true;
                                ParentData[i].ConsumedMaterialReserveBOQItem.results[j].Quantity = "";
                                ParentData[i].isChildItemFreeze = true;
                                ParentData[i].ConsumedMaterialReserveBOQItem.results[j].isChildItemFreeze = false;
                            }

                        }
                        ParentData[i].isParent = false;
                        ParentData[i].isSelected = false;
                        ParentData[i].Quantity = "";
                        
                    }
                    var TreeDataModel = new JSONModel({ results: ParentData });
                    this.getView().setModel(TreeDataModel, "TreeDataModel");
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
                    mBindingParams.parameters["navigation"] = {
                        IssuedMaterialParentSet: "IssuedMaterialBOQ",
                    };
                    mBindingParams.filters.push(
                        new sap.ui.model.Filter(
                            "SONumberId/ID",
                            sap.ui.model.FilterOperator.EQ,
                            this.sObjectId
                        )
                    );
                },
                onBeforeRebindRestTable: function (oEvent) {
                    var mBindingParams = oEvent.getParameter("bindingParams");
                    mBindingParams.filters.push(
                        new Filter(
                            "SONumberId/ID",
                            sap.ui.model.FilterOperator.EQ,
                            this.sObjectId
                        )
                    );
                    mBindingParams.sorter.push(
                        new sap.ui.model.Sorter("CreatedAt", true)
                    );
                },

                onLiveChangeQty: function (oEvent) {
                    //   var rowObj = oEvent.getSource().getBindingContext().getObject();
                    var ReservedQty = parseFloat(oEvent.getSource().getValue());
                    var oValue = oEvent.getSource().getValue();

                    var BalanceQty = parseFloat(
                        oEvent.getSource().getParent().getCells()[6].getText()
                    );

                    if (oValue === "") {
                        oEvent.getSource().setValueState("Error");
                        oEvent.getSource().setValueStateText("Please enter quantity ");
                        this.getView().byId("btnPostConsumption").setEnabled(false);
                    } else if (parseFloat(ReservedQty) < 0) {
                        oEvent.getSource().setValueState("Error");
                        oEvent
                            .getSource()
                            .setValueStateText(
                                "Please enter quantity greater than 0 or positive value"
                            );
                        this.getView().byId("btnPostConsumption").setEnabled(false);
                    } else if (parseFloat(ReservedQty) > parseFloat(BalanceQty)) {
                        oEvent.getSource().setValueState("Error");
                        oEvent
                            .getSource()
                            .setValueStateText(
                                "Please enter quantity lesser than or equal to balance quantity"
                            );
                        this.getView().byId("btnPostConsumption").setEnabled(false);
                    } else {
                        oEvent.getSource().setValueState("None");
                        this.getView().byId("btnPostConsumption").setEnabled(true);
                    }
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
                        sParentPath + "/BalanceQty"
                    );

                    if (!iTotalQuantity) iTotalQuantity = 0;
                    var ReservedQty = parseFloat(oEvent.getSource().getValue());
                    var oValue = oEvent.getSource().getValue();
                    if(!oValue)
                    oValue = 0;
                    var BalanceQty = parseFloat(
                        oEvent.getSource().getParent().getCells()[10].getText()
                    );

                    var bChildItemFreeze = this.getViewModel("TreeDataModel").getProperty(
                        sParentPath + "/isChildItemFreeze"
                    );
                    var aChildItems = this.getViewModel("TreeDataModel").getProperty(
                        sParentPath + "/ConsumedMaterialReserveBOQItem"
                    );

                    if (bChildItemFreeze) {
                        debugger;
                        aChildItems.results.forEach((item) => {
                           item.Quantity = parseFloat(oValue) * (parseFloat(item.BalanceQty) /parseFloat(iParentIssuedQuantity));
                        //    item.Quantity = parseFloat(oValue) * (parseFloat(item.BaseQty));
                        });
                        this.getViewModel("TreeDataModel").setProperty(
                            sParentPath + "/ConsumedMaterialReserveBOQItem",
                            aChildItems
                        );
                    } else {
                        if (parseFloat(oValue) >= 0) {
                            // var iTotalQty = parseFloat(oValue);
                            // if(!iTotalQty)
                            // iTotalQty =0;
                            // var aChildQty = this.getViewModel("TreeDataModel")
                            //     .getProperty(sParentPath + "/")
                            //     .IssuedMaterialReservedBOQItems.results.map(function (item) {
                            //         return {
                            //             Quantity: parseFloat(item.Quantity),
                            //         };
                            //     });
                            //   if (iTotalQuantity === null || iTotalQuantity === "") {
                            //     this.getViewModel("TreeDataModel").setProperty(
                            //       sParentPath + "/Quantity",
                            //       iTotalQty
                            //     );
                            //   }

                            // else {
                             var wpp = oEvent
                                .getSource()
                                .getBindingContext("TreeDataModel")
                                .getObject().WeightPerPiece;
                            var liveQty = oEvent
                                .getSource()
                                .getBindingContext("TreeDataModel")
                                .getObject().Quantity;
                            if (!liveQty) liveQty = 0;
                

                            // iTotalQuantity = iTotalQuantity - parseFloat(liveQty) + parseFloat(oValue);
                            iTotalQuantity = iTotalQuantity + ( ( parseFloat(oValue) - parseFloat(liveQty) ) * parseFloat(wpp));
                            this.getViewModel("TreeDataModel").setProperty(sItemPath + "/Quantity", oValue);
                            // var sum = aChildQty.reduce((a, b) => ({
                            //   x: a.Quantity + b.Quantity,
                            // }));

                            this.getViewModel("TreeDataModel").setProperty(
                                sParentPath + "/Quantity",
                                iTotalQuantity
                            );
                            // }
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
                                that.onSubmitButtonConfirmPress(
                                    ConsumptionPostingReserveId,
                                    itemData
                                );
                            }
                        },
                    });
                },
                getTableItems: function () {
                    var itemData = this.getViewModel("TreeDataModel").getData();
                    var IsAllItemsConsumed = "";
                    var totalItems = itemData.results.filter(function (item) {
                        return (
                            item.Status === "RESERVED FOR CONSUMPTION" ||
                            item.Status === "CONSUMPTION RESERVATION FAILED" ||
                            item.Status === "PARTIALLY CONSUMED"
                        );
                    });



                    totalItems.forEach(function (item) {
                        if (parseInt(item.BalanceQty) !== parseInt(item.inputQuantity)) {
                            return (IsAllItemsConsumed = false);
                        } else {
                            IsAllItemsConsumed = true;
                        }
                    });
                    // var selectedItems = itemData.filter(function (item) {
                    //     return item.isSelected === true;
                    // });
                    //   if (totalItems.length === selectedItems.length)
                    //     IsAllItemsConsumed = true;
                    //   else IsAllItemsConsumed = false;
                    return {
                        totalItems,
                        IsAllItemsConsumed,
                    };
                },
                onSelectAll: function (oeve) {
                    var isSelected = oeve.getSource().getSelected();
                    var ItemData = this.getView().getModel("consumptionData").getData();
                    var totalItems = ItemData.filter(function (item) {
                        return (
                            item.Status === "RESERVED FOR CONSUMPTION" ||
                            item.Status === "CONSUMPTION RESERVATION FAILED" ||
                            item.Status === "PARTIALLY CONSUMED"
                        );
                    });
                    if (isSelected) {
                        for (var i = 0; i < totalItems.length; i++) {
                            totalItems[i].isSelected = true;
                        }
                    } else {
                        for (var i = 0; i < ItemData.length; i++) {
                            totalItems[i].isSelected = false;
                        }
                    }
                    this.getView().getModel("consumptionData").setData(totalItems);
                },
                onSubmitButtonConfirmPress: function (CID, itemData) {
                    var IsAllItemsConsumed = itemData.IsAllItemsConsumed;
                    itemData = itemData.totalItems.map(function (item) {
                        return {
                            ConsumedMaterialReserveItemId: parseInt(item.ID),
                            Quantity: parseFloat(item.Quantity),
                            BoqItem: item.ConsumedMaterialReserveBOQItem.results.map(
                                function (items) {
                                    return {
                                        ConsumedMaterialReserveBOQItemId: parseInt(items.ID),
                                        Quantity: parseFloat(items.Quantity),
                                    };
                                }
                            ),
                        };
                    });




                    var oPayload = {
                        UserName: "Agel",
                        ConsumptionPostingReserveId: parseInt(100),
                        IsAllItemsConsumed: IsAllItemsConsumed,
                        ParentItem: itemData,
                    };
                    this.MainModel.create("/ConsumptionPostingEdmSet", oPayload, {
                        success: function (oData, oResponse) {
                            if (oData.Success === true) {
                                sap.m.MessageBox.success(
                                    "Cosumption Posted with Material Document Number " +
                                    "" +
                                    oData.MaterialDocumentNumber +
                                    "" +
                                    " Succesfully created!",
                                    {
                                        title: "Success",
                                        onClose: function (oAction1) {
                                            if (oAction1 === sap.m.MessageBox.Action.OK) {
                                                this.handleToAllPOBreadcrumPress();
                                                this.MainModel.refresh();
                                            }
                                        }.bind(this),
                                    }
                                );
                            } else {
                                sap.m.MessageBox.error(oData.Message);
                            }
                        }.bind(this),
                        error: function (oError) {
                            sap.m.MessageBox.error(oError.Message);
                        },
                    });
                },
            }
        );
    }
);
