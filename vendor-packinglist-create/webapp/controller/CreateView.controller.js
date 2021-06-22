sap.ui.define([
    "./BaseController",
    "sap/ui/core/Fragment",
    "sap/ui/Device",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox"
],
    function (BaseController, Fragment, Device, JSONModel, MessageBox) {
        "use strict";

        return BaseController.extend("com.agel.mmts.vendorpackinglistcreate.controller.CreateView", {
            onInit: function () {
                this.mainModel = this.getOwnerComponent().getModel();
                //Router Object
                this.oRouter = this.getOwnerComponent().getRouter();
                this.oRouter.getRoute("RouteCreateView").attachPatternMatched(this._onObjectMatched, this);

                //view model instatiation
                var oViewModel = new JSONModel({
                    busy: false,
                    delay: 0,
                    isPackagingTableVisible: false,
                    isPackingListInEditModel: false,
                    isEnteredValuesValid: true
                });
                this.setModel(oViewModel, "objectViewModel");

            },

            _onObjectMatched: function (oEvent) {
                var objectViewModel = this.getViewModel("objectViewModel");
                var that = this;

                var startupParams = this.getOwnerComponent().getComponentData().startupParameters;

                this.packingListId = startupParams.packingListID[0];
               // this.packingListId = 43;

                this.getView().bindElement({
                    path: "/PackingListSet(" + this.packingListId + ")",
                    events: {
                        dataRequested: function () {
                            objectViewModel.setProperty("/busy", true);
                        },
                        dataReceived: function () {
                            // var bIsProcessOneCompletes = this.getBoundContext().getObject().IsProcessOneCompletes;
                            // if (bIsProcessOneCompletes)
                            objectViewModel.setProperty("/isPackingListInEditModel", false);
                            // else
                            // objectViewModel.setProperty("/isPackingListInEditModel", true);
                            objectViewModel.setProperty("/busy", false);
                        }
                    }
                });
                this._getPackingListContainsData();
                this._getPackingListInnerPackagingData();
            },

            onViewBOQItemsPress: function (oEvent) {
                var sBOQItemPath = oEvent.mParameters.getSource().getBindingContext().getPath();
                var sDialogTitle = oEvent.mParameters.getSource().getBindingContext().getObject().Name + " Items";
                var oDetails = {};
                oDetails.controller = this;
                oDetails.view = this.getView();
                oDetails.sBOQItemPath = sBOQItemPath;
                oDetails.title = sDialogTitle;
                if (!this.boqDialog) {
                    this.boqDialog = Fragment.load({
                        id: oDetails.view.getId(),
                        name: "com.agel.mmts.vendorpackinglistcreate.view.fragments.createView.ViewBOQItems",
                        controller: oDetails.controller
                    }).then(function (oDialog) {
                        // connect dialog to the root view of this component (models, lifecycle)
                        oDetails.view.addDependent(oDialog);
                        oDialog.bindElement({
                            path: oDetails.sBOQItemPath
                        });
                        oDialog.setTitle(oDetails.title)
                        if (Device.system.desktop) {
                            oDialog.addStyleClass("sapUiSizeCompact");
                        }
                        return oDialog;
                    });
                }
                this.boqDialog.then(function (oDialog) {
                    oDetails.view.addDependent(oDialog);
                    oDialog.bindElement({
                        path: oDetails.sBOQItemPath,
                    });
                    oDialog.open();
                });
            },

            onViewBOQItemDialogClose: function (oEvent) {
                this.boqDialog.then(function (oDialog) {
                    oDialog.close();
                });
            },

            _getPackingListContainsData: function () {
                this.mainModel.read("/PackingListSet(" + this.packingListId + ")/PackingListContains", {
                    success: function (oData, oResponse) {
                        if (oData.results.length)
                            this._setPackingListContainsData(oData.results);
                    }.bind(this),
                    error: function (oError) {

                    }
                })
            },

            _getPackingListInnerPackagingData: function () {
                this.mainModel.read("/PackingListSet(" + this.packingListId + ")/InnerPackagings", {
                    success: function (oData, oResponse) {
                        if (oData.results.length)
                            this._setPackingListInnerPackagingData(oData.results);
                    }.bind(this),
                    error: function (oError) {

                    }
                })
            },

            _setPackingListContainsData: function (data) {
                var oModel = new JSONModel({ items: data });
                this.getView().setModel(oModel, "packingListContainsModel");
            },

            _setPackingListInnerPackagingData: function (data) {
                var oModel = new JSONModel({ items: data });
                this.getView().setModel(oModel, "InnerPackagingModel");
            },

            onGeneratePackingList: function (oEvent) {
                var that = this;
                if (oEvent.mParameters.getSource().getText() === "Regenerate Packing List") {
                    MessageBox.warning("This action would reset the previosly created Inner Packaging table. Once done cannot be restored. Do you wish to continue?", {
                        actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                        emphasizedAction: MessageBox.Action.OK,
                        onClose: function (sAction) {
                            if (sAction === "OK"){
                                var isFirstTime = false;
                                that._generatePackagingListConfirmed(isFirstTime);
                            }
                        }
                    });
                } else {
                    var isFirstTime = true;
                    that._generatePackagingListConfirmed(isFirstTime);
                }
            },

            onSavePackingListPress: function (oEvent) {
                if (!this._validateProceedData()) {
                    return;
                }
                if (this.getView().getModel("InnerPackagingModel"))
                    var aInnerPackaging = this.getView().getModel("InnerPackagingModel").getData().items;
                else
                    var aInnerPackaging = [];

                var payload = {};
                payload.ID = parseInt(this.getView().getBindingContext().getObject().ID);
                if (aInnerPackaging.length)
                    payload.IsProcessOneCompletes = true;
                else
                    payload.IsProcessOneCompletes = false;
                payload.IsDraft = true;
                payload.PackingListContains = this.getView().getModel("packingListContainsModel").getData().items;
                payload.InnerPackagings = aInnerPackaging;

                this.mainModel.create("/PackingListEdmSet", payload, {
                    success: function (oData, oResponse) {
                        //this.getViewModel("objectViewModel").setProperty("/isPackingListInEditModel", false);
                        sap.m.MessageToast.show("Packing List saved successfully!");
                        this.getViewModel("objectViewModel").setProperty("/isPackingListInEditModel", false);
                        this.getView().getModel().refresh();
                    }.bind(this),
                    error: function (oError) {
                        sap.m.MessageBox.error(JSON.stringify(oError));
                        this.getViewModel("objectViewModel").setProperty("/isPackingListInEditModel", false);
                    }.bind(this)
                });

            },

            onProceedStep1Press: function (oEvent) {
                // if (this.getView().getBindingContext().getObject().IsProcessOneCompletes)
                if (!this._validateProceedData()) {
                    return;
                }
                this.oRouter.navTo("RouteCreateViewStep2", {
                    packingListId: this.packingListId
                });
            },

            _validateProceedData: function () {
                var bValid = true;
                if (this.getView().getModel("packingListContainsModel")) {
                    var aPackingListContainsData = this.getView().getModel("packingListContainsModel").getData().items;

                    for (let i = 0; i < aPackingListContainsData.length; i++) {
                        if (!aPackingListContainsData[i].PackagingType || !aPackingListContainsData[i].PackagingTypeId) {
                            bValid = false;
                            sap.m.MessageBox.alert("Please Select the Packaging Types before proceeding");
                            return;
                        }

                        if (!aPackingListContainsData[i].NumberOfPackages) {
                            bValid = false;
                            sap.m.MessageBox.alert("Please fill in all the number of packages.");
                            return;
                        }

                    }
                }

                if (this.getView().getModel("InnerPackagingModel")) {
                    var aInnerPackagingData = this.getView().getModel("InnerPackagingModel").getData().items;

                    for (let i = 0; i < aInnerPackagingData.length; i++) {
                        if (!aInnerPackagingData[i].PackagingQty) {
                            bValid = false;
                            sap.m.MessageBox.alert("Please fill in all the Packaging Qunatities before proceeding");
                            return;
                        }
                    }
                }

                return bValid;
            },

            _generatePackagingListConfirmed: function (isFirstTime) {
                if (!isFirstTime) {
                    if (!this._validateGenerateData()) {
                        return;
                    }
                }

                var data = this.getView().getModel("packingListContainsModel").getData().items;
                console.log({ data })
                var items = [];
                for (var i = 0; i < data.length; i++) {
                    for (var j = 0; j < data[i].NumberOfPackages; j++) {
                        var oEntry = {};
                        oEntry.PackagingType = data[i].PackagingType;
                        oEntry.LineNumber = data[i].Name;
                        oEntry.materialUniqueIDForValidation = data[i].ID;
                        oEntry.PackagingQty = null;
                        oEntry.UOM = data[i].UOM;
                        items.push(oEntry);
                    }
                }
                console.log({ items });
                var oModel = new JSONModel({ items: items });
                this.getView().setModel(oModel, "InnerPackagingModel");
                this.getView().getModel("objectViewModel").setProperty("/isPackagingTableVisible", true);
            },

            _validateGenerateData: function () {
                var bValid = true;

                var aPackingListContainsData = this.getView().getModel("packingListContainsModel").getData().items;
                var aInnerPackagingData = this.getView().getModel("InnerPackagingModel").getData().items;

                for (let i = 0; i < aPackingListContainsData.length; i++) {
                    if (!aPackingListContainsData[i].PackagingType || !aPackingListContainsData[i].PackagingTypeId) {
                        bValid = false;
                        sap.m.MessageBox.alert("Please Select the Packaging Types before proceeding");
                        return;
                    }

                    if (!aPackingListContainsData[i].NumberOfPackages) {
                        bValid = false;
                        sap.m.MessageBox.alert("Please fill in all the number of packages.");
                        return;
                    }
                }

                //bValid = false;
                return bValid;
            },

            onEditPackingListPress: function (oEvent) {
                this.getViewModel("objectViewModel").setProperty("/isPackingListInEditModel", true);
            }


        });
    });
