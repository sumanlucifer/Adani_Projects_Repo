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

    return BaseController.extend("com.agel.mmts.mdmboqitems.controller.Detail", {

        onInit: function () {
            //view model instatiation
            var oViewModel = new JSONModel({
                busy: false,
                delay: 0,
                idSFDisplay: true,
                idSFEdit: false,
                idSFCreate: false,
                idBtnEdit: true,
                idBtnSave: false,
                idBtnCancel: false,
                idBtnDelete: true,
                showFooter: false
            });
            this.setModel(oViewModel, "objectViewModel");

            //Router Object
            this.oRouter = this.getRouter();
            this.oRouter.getRoute("detail").attachPatternMatched(this._onObjectMatched, this);

            this.mainModel = this.getComponentModel();
        },

        _onObjectMatched: function (oEvent) {
            var oMasterParentsModel = new JSONModel([]);
            this.setModel(oMasterParentsModel, "MasterParentsModel");

            this.sParentID = oEvent.getParameter("arguments").parentMaterial;
            var sLayout = oEvent.getParameter("arguments").layout;

            this.getView().getModel().setProperty("/busy", false);

            this.getView().getModel("layoutModel").setProperty("/layout", sLayout);

            //added
            var oSelectedKeyModel = new JSONModel();
            this.getView().setModel(oSelectedKeyModel, "oSelectedKeyModel");

            if (this.sParentID === "new") {
                //added
                var items = { selectedItems: [] }
                this.getView().getModel("oSelectedKeyModel").setData(items);

                this.fnSetCreateFieldsVisibility();

                this.mainModel.setDeferredBatchGroups(["createGroup"]);

                this._oNewContext = this.mainModel.createEntry("/MasterBoQItemSet", {
                    groupId: "createGroup",
                    properties: {
                        ID: "",
                        Name: "",
                        Description: "",
                        MaterialCode: "",
                        UOMs: []
                    }
                });
                this._oObjectPath = this._oNewContext.sPath;
                this.getView().bindElement({
                    path: this._oObjectPath
                });
            } else {
                //added
                this.getSelectedKeys(this.sParentID);

                this.fnResetFieldsVisibility();

                this._bindView("/MasterBoQItemSet" + this.sParentID);
            }
        },

        fnSetCreateFieldsVisibility: function () {
            this.getViewModel("objectViewModel").setProperty("/idSFDisplay", false);
            this.getViewModel("objectViewModel").setProperty("/idSFEdit", true);
            this.getViewModel("objectViewModel").setProperty("/idSFCreate", true);

            this.getViewModel("objectViewModel").setProperty("/showFooter", true);
            this.getViewModel("objectViewModel").setProperty("/idBtnDelete", false);
            this.getViewModel("objectViewModel").setProperty("/idBtnEdit", false);
            this.getViewModel("objectViewModel").setProperty("/idBtnSave", true);
            this.getViewModel("objectViewModel").setProperty("/idBtnCancel", true);
        },

        fnSetOnEditFieldsVisibility: function () {
            this.getViewModel("objectViewModel").setProperty("/showFooter", true);
            this.getViewModel("objectViewModel").setProperty("/idBtnEdit", false);
            this.getViewModel("objectViewModel").setProperty("/idBtnSave", true);
            this.getViewModel("objectViewModel").setProperty("/idBtnCancel", true);

            this.getViewModel("objectViewModel").setProperty("/idSFDisplay", false);
            this.getViewModel("objectViewModel").setProperty("/idSFEdit", true);
            this.getViewModel("objectViewModel").setProperty("/idSFCreate", false);
        },

        fnResetFieldsVisibility: function () {
            this.getViewModel("objectViewModel").setProperty("/idSFDisplay", true);
            this.getViewModel("objectViewModel").setProperty("/showFooter", false);
            this.getViewModel("objectViewModel").setProperty("/idBtnDelete", true);
            this.getViewModel("objectViewModel").setProperty("/idBtnEdit", true);
            this.getViewModel("objectViewModel").setProperty("/idSFEdit", false);
            this.getViewModel("objectViewModel").setProperty("/idSFCreate", false);
            this.getViewModel("objectViewModel").setProperty("/idBtnSave", false);
            this.getViewModel("objectViewModel").setProperty("/idBtnCancel", false);
        },

        _bindView: function (sObjectPath) {
            var objectViewModel = this.getViewModel("objectViewModel");

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

        getSelectedKeys: function (sParentID) {
            var sReadPath = "/MasterBoQItemSet" + sParentID;
            this.getComponentModel().read(sReadPath, {
                urlParameters: {
                    $expand: "UOMs,MasterParents/MasterParentMaterial"
                },
                success: function (oData) {
                    var aUOMsData = oData.UOMs.results;
                    var aMasterMaterialData = oData.MasterParents.results;
                    if (aUOMsData.length) {
                        var selectedKeys = [];
                        for (var i = 0; i < aUOMsData.length; i++) {
                            selectedKeys.push(aUOMsData[i].MasterUOMId);
                        }
                        var items = { selectedItems: [selectedKeys] }
                        this.getView().getModel("oSelectedKeyModel").setData(items);
                    }
                    else{
                        var items = { selectedItems: [] }
                        this.getView().getModel("oSelectedKeyModel").setData(items);
                    }

                    if (aMasterMaterialData.length) {
                        var aMasterParents = [];
                        for (var i = 0; i < aMasterMaterialData.length; i++) {
                            aMasterParents.push({
                                "ParentMaterialCode": aMasterMaterialData[i].MasterParentMaterial.Description,
                                "MasterMaterialId": aMasterMaterialData[i].MasterMaterialId,
                                "BaseQty": aMasterMaterialData[i].BaseQty
                            });
                        }
                        this.getView().getModel("MasterParentsModel").setData(aMasterParents);
                        this.getView().getModel("MasterParentsModel").refresh();
                    }else{
                        this.getView().getModel("MasterParentsModel").setData([]);
                    }

                }.bind(this),
                error: function (oError) {
                    MessageBox.error(JSON.stringify(oError));
                }
            });
        },

        onEdit: function () {
            this.fnSetOnEditFieldsVisibility();
        },

        onSave: function () {
            var that = this;
            var oPayload = {};
            var arr = [];
            var name = this.byId("nameEdit").getValue();
            var description = this.byId("nameDesc").getValue();
            var materialCode = this.byId("mcodeEdit").getValue();
            if (name == "") {
                MessageBox.error(this.getResourceBundle().getText("PleaseenterName"));
                return;
            }
            else if (description == "") {
                MessageBox.error(this.getResourceBundle().getText("PleaseenterDescription"));
                return;
            }
            else if (materialCode == "") {
                MessageBox.error(this.getResourceBundle().getText("PleaseenterMaterialCode"));
                return;
            }

            oPayload.Name = name;
            oPayload.Description = description;
            oPayload.MaterialCode = materialCode;
            oPayload.StoreStockBOQs = null;

            var selectedData = this.byId("uomEdit").getSelectedItems();
            for (var i = 0; i < selectedData.length; i++) {
                var obj = {};
                obj.Name = selectedData[i].getProperty("text");
                obj.MasterUOMId = selectedData[i].getProperty("key");
                arr.push(obj);
            }

            if (arr == "") {
                MessageBox.error(this.getResourceBundle().getText("PleaseenterUOM"));
                return;
            }

            oPayload.UOMs = arr;
            var aMasterParents = this.getView().getModel("MasterParentsModel").getProperty("/"),
                iIncompleteMaterialsIndex = aMasterParents.findIndex(function (oMaterial) {
                    return oMaterial.MasterMaterialId === null || oMaterial.BaseQty <= 0;
                });

            if (iIncompleteMaterialsIndex >= 0) {
                MessageBox.error(this.getResourceBundle().getText("Pleaseentervalidentry"));
                return;
            }


            oPayload.MasterParents = aMasterParents;

            if (this.sParentID === "new") {
                MessageBox.confirm(this.getResourceBundle().getText("DoyouwanttosaveBOQitem", [name]), {
                    icon: MessageBox.Icon.INFORMATION,
                    title: "Confirm",
                    actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                    emphasizedAction: MessageBox.Action.YES,
                    onClose: function (oAction) {
                        if (oAction == "YES") {
                            this.getComponentModel("app").setProperty("/busy", true);
                            this.mainModel.create("/MasterBoQItemSet", oPayload, {
                                success: function (oData, oResponse) {
                                    MessageBox.success(this.getResourceBundle().getText("BOQitemcreatedsuccessfully"));
                                    this.onCancel();
                                    this.getComponentModel("app").setProperty("/busy", false);
                                }.bind(this),
                                error: function (oError) {
                                    MessageBox.error(JSON.stringify(oError));
                                    this.getComponentModel("app").setProperty("/busy", false);
                                }.bind(this)
                            });
                        }
                    }.bind(this)
                });
            }
            else {
                var sPath = this.getView().getBindingContext().getPath();
                that.getComponentModel("app").setProperty("/busy", true);
                that.mainModel.update(sPath, oPayload, {
                    success: function (oData, oResponse) {
                        MessageBox.success(this.getResourceBundle().getText("BOQitemupdatedsuccessfully"));
                        that.onCancel();
                        that.getComponentModel("app").setProperty("/busy", false);
                    }.bind(this),
                    error: function (oError) {
                        that.getComponentModel("app").setProperty("/busy", false);
                        MessageBox.error(JSON.stringify(oError));
                    }
                });
            }
        },

        onCancel: function () {
            this.getViewModel("objectViewModel").setProperty("/idBtnEdit", true);
            this.getViewModel("objectViewModel").setProperty("/idBtnSave", false);
            this.getViewModel("objectViewModel").setProperty("/idBtnCancel", false);
            this.getViewModel("objectViewModel").setProperty("/showFooter", false);

            this.getViewModel("objectViewModel").setProperty("/idSFDisplay", true);
            this.getViewModel("objectViewModel").setProperty("/idSFEdit", false);
            this.getViewModel("objectViewModel").setProperty("/idSFCreate", false);

            if (this.sParentID === "new") {
                this.oRouter.navTo("LandingPage", {
                },
                    false
                );
            }
        },

        // On Delete //
        onDelete: function (oEvent) {
            var that = this;
            var name = this.getView().getBindingContext().getObject().Name;
            var sPath = this.getView().getBindingContext().getPath();
            this.getComponentModel("app").setProperty("/busy", true);
            MessageBox.confirm(this.getResourceBundle().getText("DoyouwanttodeleteBOQitem", [name]), {
                icon: MessageBox.Icon.WARNING,
                title: "Confirm",
                actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                emphasizedAction: MessageBox.Action.YES,
                onClose: function (oAction) {
                    if (oAction == "YES") {
                        that.getComponentModel("app").setProperty("/busy", true);
                        that.mainModel.remove(sPath, {
                            success: function (oData, oResponse) {
                                MessageBox.success(this.getResourceBundle().getText("UOMitemdeletedsuccessfully"));
                                that.onCancel();
                                that.onNavigateToMaster();
                                that.getComponentModel("app").setProperty("/busy", false);
                            }.bind(this),
                            error: function (oError) {
                                that.getComponentModel("app").setProperty("/busy", false);
                                MessageBox.error(JSON.stringify(oError));
                            }
                        });
                    }
                }
            });
        },

        onNavigateToMaster: function () {
            this.oRouter.navTo("LandingPage", {
            },
                false
            );
        },

        onAddParentPress: function () {
            var oMasterMaterialData = {
                "MasterMaterialId": null,
                // "ParentMaterialCode": null,
                // "MasterParentId": null,
                "BaseQty": 0
            },
                aMasterParents = this.getView().getModel("MasterParentsModel").getProperty("/");

            aMasterParents.push(oMasterMaterialData);
            this.getView().getModel("MasterParentsModel").setProperty("/", aMasterParents);
            this.getView().getModel("MasterParentsModel").refresh();
        },

        handleParentChange: function (oEvent) {
            var sItemPath = oEvent.getSource().getBindingContext("MasterParentsModel").getPath(),
                oItemObj = this.getView().getModel("MasterParentsModel").getProperty(sItemPath);

            if (oEvent.getParameter("selectedItem")) {
                oEvent.getSource().setValueState("None");
                var sMaterialId = oEvent.getParameter("selectedItem").getBindingContext().getObject().ID;
                // sMaterialCode = oEvent.getParameter("selectedItem").getBindingContext().getObject().MaterialCode;

                oItemObj.MasterMaterialId = sMaterialId;
                // oItemObj.ParentMaterialCode = sMaterialCode;

                this.getView().getModel("MasterParentsModel").setProperty(sItemPath, oItemObj);
            }
            else {
                oItemObj.MasterMaterialId = null;
                // oItemObj.ParentMaterialCode = null;
                this.getView().getModel("MasterParentsModel").setProperty(sItemPath, oItemObj);
                oEvent.getSource().setValueState(this.getResourceBundle().getText("Error"));
                oEvent.getSource().setValueStateText(this.getResourceBundle().getText("PleaseenteravalidMaterial"));
            }
        }
    });
});            
