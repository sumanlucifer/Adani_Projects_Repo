sap.ui.define([
    "./BaseController",
    "sap/ui/core/Fragment",
    "sap/ui/Device",
    "sap/ui/model/json/JSONModel"
],
    function (BaseController, Fragment, Device, JSONModel) {
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
                    isPackingListInEditModel: false
                });
                this.setModel(oViewModel, "objectViewModel");

            },

            _onObjectMatched: function (oEvent) {
                var objectViewModel = this.getViewModel("objectViewModel");
                var that = this;

                var startupParams = this.getOwnerComponent().getComponentData().startupParameters;

                this.packingListId = startupParams.packingListID[0];

                this.getView().bindElement({
                    path: "/PackingListSet(" + this.packingListId + ")",
                    events: {
                        dataRequested: function () {
                            objectViewModel.setProperty("/busy", true);
                        },
                        dataReceived: function () {
                            var bIsProcessOneCompletes = this.getBoundContext().getObject().IsProcessOneCompletes;
                            if (bIsProcessOneCompletes)
                                objectViewModel.setProperty("/isPackingListInEditModel", false);
                            else
                                objectViewModel.setProperty("/isPackingListInEditModel", true);
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
                var data = this.getView().getModel("packingListContainsModel").getData().items;
                console.log({ data })
                var items = [];
                for (var i = 0; i < data.length; i++) {
                    for (var j = 0; j < data[i].NumberOfPackages; j++) {
                        var oEntry = {};
                        oEntry.PackagingType = data[i].PackagingType;
                        oEntry.LineNumber = data[i].Name.substr(0, 5);
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

            onSavePackingListPress: function (oEvent) {
                var payload = {};
                payload.ID = parseInt(this.getView().getBindingContext().getObject().ID);
                payload.IsProcessOneCompletes = true;
                payload.IsDraft = true;
                payload.PackingListContains = this.getView().getModel("packingListContainsModel").getData().items;
                payload.InnerPackagings = this.getView().getModel("InnerPackagingModel").getData().items;

                this.mainModel.create("/PackingListEdmSet", payload, {
                    success: function (oData, oResponse) {
                        //this.getViewModel("objectViewModel").setProperty("/isPackingListInEditModel", false);
                    }.bind(this),
                    error: function (oError) {
                        sap.m.MessageBox.error(JSON.stringify(oError));
                    }
                });
            },

            onProceedStep1Press: function (oEvent) {
                this.oRouter.navTo("RouteCreateViewStep2", {
                    packingListId: this.packingListId
                });
            },

            onEditPackingListPress: function (oEvent) {
                this.getViewModel("objectViewModel").setProperty("/isPackingListInEditModel", true);
            }


        });
    });
