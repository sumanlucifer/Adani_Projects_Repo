sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/Fragment",
    "sap/ui/model/Sorter",
    "sap/ui/Device",
    "sap/ui/core/routing/History",
    'sap/m/MessageToast',
    "sap/m/MessageBox",
], function (BaseController, JSONModel, Filter, FilterOperator, Fragment, Sorter, Device, History, MessageToast, MessageBox) {
    "use strict";

    return BaseController.extend("com.agel.mmts.mdmuom.controller.Detail", {

        onInit: function () {
            //view model instatiation
            var oViewModel = new JSONModel({
                busy: false,
                delay: 0,
                idSFDisplay: true,
                idSFEdit: false,
                idBtnEdit: true,
                idBtnSave: false,
                idBtnCancel: false
            });
            this.setModel(oViewModel, "objectViewModel");

            //Router Object
            this.oRouter = this.getRouter();
            this.oRouter.getRoute("detail").attachPatternMatched(this._onObjectMatched, this);

            var oManageBOQModel = new JSONModel({
                boqItems: [{
                    Name: "",
                    MaterialCode: "",
                    Qty: "",
                    Remarks: "",
                    UOM: "",
                    UOMSuggestions: null

                }]
            });
            this.setModel(oManageBOQModel, "ManageBOQModel");

            this.mainModel = this.getComponentModel();
        },

        _onObjectMatched: function (oEvent) {
            this.sParentID = oEvent.getParameter("arguments").parentMaterial;
            var sLayout = oEvent.getParameter("arguments").layout;

            this.getView().getModel().setProperty("/busy", false);

            this.getView().getModel("layoutModel").setProperty("/layout", sLayout);

            if (this.sParentID === "new") {
                this.mainModel.setDeferredBatchGroups(["createGroup"]);

                this._oNewContext = this.mainModel.createEntry("/MasterUOMSet", {
                    groupId: "createGroup",
                    properties: {
                        ID: "",
                        Name: "",
                        Description: ""
                    }
                });
                this._oObjectPath = this._oNewContext.sPath;
                //this.getView().setBindingContext(this._oNewContext);
                this.getView().bindElement({
                    path: this._oObjectPath
                });
            } else {
                this._bindView("/MasterUOMSet" + this.sParentID);
            }
        },

        _bindView: function (sObjectPath) {
            var objectViewModel = this.getViewModel("objectViewModel");
            var that = this;

            this.getView().bindElement({
                path: sObjectPath,
                events: {
                    dataRequested: function () {
                        objectViewModel.setProperty("/busy", true);
                    },
                    dataReceived: function () {
                        objectViewModel.setProperty("/busy", false);
                    }
                }
            });
        },

        onEdit: function () {

            this.getViewModel("objectViewModel").setProperty("/idBtnEdit", false);
            this.getViewModel("objectViewModel").setProperty("/idBtnSave", true);
            this.getViewModel("objectViewModel").setProperty("/idBtnCancel", true);

            this.getViewModel("objectViewModel").setProperty("/idSFDisplay", false);
            this.getViewModel("objectViewModel").setProperty("/idSFEdit", true);

            //   this.byId("idBtnEdit").setVisible(false);
            //   this.byId("idBtnSave").setVisible(true);
            //      this.byId("idBtnCancel").setVisible(true);

            //   this.byId("idSFDisplay").setVisible(false);
            //   this.byId("idSFEdit").setVisible(true);

        },

        onSave: function () {
                var that = this;
                var oPayload = {};
                oPayload.Name = this.byId("nameEdit").getValue();
                oPayload.Description = this.byId("nameDesc").getValue();

                this.mainModel.create("/MasterUOMSet", oPayload, {
                    success: function (oData, oResponse) {
                        sap.m.MessageBox.success(oData.Message);
                        // this.getViewModel("objectViewModel").setProperty("/isCreatingPCList", false);
                        this.getView().getModel().refresh();
                        that.onCancel();
                    }.bind(this),
                    error: function (oError) {
                        sap.m.MessageBox.error(JSON.stringify(oError));
                    }
                });
        },

        onCancel: function () {
            /*  this.byId("idSFDisplay").setVisible(true);
              this.byId("idSFEdit").setVisible(false);
  
              this.byId("idBtnEdit").setVisible(true);
              this.byId("idBtnSave").setVisible(false);
              this.byId("idBtnCancel").setVisible(false);*/

            this.getViewModel("objectViewModel").setProperty("/idBtnEdit", true);
            this.getViewModel("objectViewModel").setProperty("/idBtnSave", false);
            this.getViewModel("objectViewModel").setProperty("/idBtnCancel", false);

            this.getViewModel("objectViewModel").setProperty("/idSFDisplay", true);
            this.getViewModel("objectViewModel").setProperty("/idSFEdit", false);
        },

        onCreateNewPCListPress: function (oEvent) {
            this.getViewModel("objectViewModel").setProperty("/isCreatingPCList", true)
        },

        onCancelPCListCreationPress: function (oEvent) {
            this.getViewModel("objectViewModel").setProperty("/isCreatingPCList", false)
        },

        onPCListSelectionChange: function (oEvent) {
            var isSelected = oEvent.getParameter("selected");
            this.getViewModel("objectViewModel").setProperty("/isPCListSelected", isSelected);
        },

        onCreateBOQPress: function (oEvent) {
            var oSelectedItemData = this.byId("idPCListTable").getSelectedItem().getBindingContext().getObject();
            var boqCreationModel = new JSONModel({
                selectedItemData: oSelectedItemData,
                quantity: null,
                isConfirmButtonEnabled: false,
                valueState: null,
                valueStateText: ""
            });
            this.getView().setModel(boqCreationModel, "boqCreationModel");

            if (!this._oBOQCreationDialog) {
                this._oBOQCreationDialog = sap.ui.xmlfragment("com.agel.mmts.vendormanageboq.view.fragments.detailPage.BOQQuantityGetter", this);
                this.getView().addDependent(this._oBOQCreationDialog);
            }
            this._oBOQCreationDialog.open();
        },

        onQuantityLiveChange: function (oEvent) {
            var oPOData = this.getView().getBindingContext().getObject();
            if (oEvent.getSource().getValue().length)
                this.getViewModel("boqCreationModel").setProperty("/isConfirmButtonEnabled", true);
            else
                this.getViewModel("boqCreationModel").setProperty("/isConfirmButtonEnabled", false);

            if (parseInt(oEvent.getSource().getValue()) > parseInt(oPOData.Quantity)) {
                this.getViewModel("boqCreationModel").setProperty("/valueState", "Error");
                this.getViewModel("boqCreationModel").setProperty("/valueStateText", "BOQ quantity should not exceed PO Material quantity.");
            }
            else {
                this.getViewModel("boqCreationModel").setProperty("/valueState", null);
                this.getViewModel("boqCreationModel").setProperty("/valueStateText", "");
            }
        },

        onCancelBOQCreationProcess: function (oEvent) {
            this._oBOQCreationDialog.close();
        },

        onConfirmCreateBOQPress: function (oEvent) {
            this._oBOQCreationDialog.close();
            var sQuantity = this.getViewModel("boqCreationModel").getProperty("/quantity");
            var oSelectedItemData = this.byId("idPCListTable").getSelectedItem().getBindingContext().getObject();
            var oModel = this.getComponentModel();

            if (sQuantity !== "0")
                var oPayload = {
                    "QTY": parseInt(sQuantity),
                    "PCGroupId": parseInt(oSelectedItemData.ID),
                    "ParentLineItemId": parseInt(oSelectedItemData.ParentLineItemID)
                };
            else
                sap.m.MessageBox.error("PC List created with no Quantity!");

            if (oPayload) {
                oModel.create("/BOQCalculationSet", oPayload, {
                    success: function (oData) {
                        sap.m.MessageBox.success(oData.Message);
                        this.getComponentModel().refresh();
                    }.bind(this),
                    error: function (oError) {
                        sap.m.MessageBox.error(JSON.stringify(oError));
                    }
                });
            }

        },

        onViewBOQRequests: function (oEvent) {
            if (oEvent.getParameter("pressed")) {
                this.getViewModel("objectViewModel").setProperty("/sViewBOQButtonName", "Close BOQ List");
                this.oRouter.navTo("detailDetail", {
                    parentMaterial: this.sParentID,
                    pcList: "pc",
                    layout: "ThreeColumnsMidExpanded"
                },
                    false);
            } else {
                this.getViewModel("objectViewModel").setProperty("/sViewBOQButtonName", "View BOQ List");
                this.oRouter.navTo("detail", {
                    parentMaterial: this.sParentID,
                    layout: "TwoColumnsMidExpanded"
                },
                    false
                );
            }

        },

        onUseSelectedPress: function (oEvent) {
            var sSelectedItemPath = this.byId("idPCListTable").getSelectedItem().getBindingContextPath();
            var sItemPath = sSelectedItemPath + "/PCGroupItems";
            var oModel = this.getComponentModel();
            oModel.read(sItemPath, {
                success: function (oData, oResponse) {
                    if (oData.results.length) {
                        var boqData = oData.results;
                        this._setDataInTable(boqData);
                    }
                }.bind(this),
                error: function (oError) {
                    debugger;
                }
            });

        },

        _setDataInTable: function (data) {
            var boqItem = {};
            var aBOQItems = [];

            for (var i = 0; i < data.length; i++) {
                boqItem.MaterialCode = data[i].MaterialCode;
                boqItem.Name = data[i].Name;
                boqItem.Qty = data[i].Qty;
                boqItem.Remarks = ""
                boqItem.UOM = data[i].UOM;
                boqItem.UOMSuggestions = null;

                aBOQItems.push(boqItem);
            }
            this._getUOMSuggestions(aBOQItems, data);
            this.getViewModel("ManageBOQModel").setProperty("/boqItems", aBOQItems);
            this.getViewModel("objectViewModel").setProperty("/isCreatingPCList", true);
        },

        _getUOMSuggestions: function (aBOQItems, data) {
            var oModel = this.getView().getModel();
            this.suggestions = [];
            for (var i = 0; i < aBOQItems.length; i++) {
                var oBindingContextPath = "/MasterBoQItemSet(" + data[i].ID + ")/UOMs";
                oModel.read(oBindingContextPath, {
                    success: function (oData, oResponse) {
                        this.suggestions.push(oData.results);
                    }.bind(this),
                    error: function (oError) {
                        sap.m.MessageBox.error("Error fetching UOMs");
                    }
                });
            }
            debugger;
        },

        onViewChildItemsPress: function (oEvent) {
            var sParentItemPath = oEvent.getSource().getBindingContext().getPath();
            var sDialogTitle = "BOQ Items for " + oEvent.getSource().getBindingContext().getObject().Name;
            var oDetails = {};
            oDetails.controller = this;
            oDetails.view = this.getView();
            oDetails.sParentItemPath = sParentItemPath;
            oDetails.title = sDialogTitle;
            if (!this.pDialog) {
                this.pDialog = Fragment.load({
                    id: oDetails.view.getId(),
                    name: "com.agel.mmts.vendormanageboq.view.fragments.detailPage.ViewLineItemsDialog",
                    controller: oDetails.controller
                }).then(function (oDialog) {
                    // connect dialog to the root view of this component (models, lifecycle)
                    oDetails.view.addDependent(oDialog);
                    oDialog.bindElement({
                        path: oDetails.sParentItemPath,
                        parameters: {
                            "expand": 'PCGroupItems'
                        }
                    });
                    oDialog.setTitle(oDetails.title)
                    if (Device.system.desktop) {
                        oDialog.addStyleClass("sapUiSizeCompact");
                    }
                    return oDialog;
                });
            }
            this.pDialog.then(function (oDialog) {
                oDetails.view.addDependent(oDialog);
                oDialog.bindElement({
                    path: oDetails.sParentItemPath,
                    parameters: {
                        'expand': 'PCGroupItems'
                    }
                });
                oDialog.open();
            });
        },

        onViewChildDialogClose: function (oEvent) {
            this.pDialog.then(function (oDialog) {
                oDialog.close();
            });
        }


    });
});            
