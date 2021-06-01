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
            this.sParentID = oEvent.getParameter("arguments").parentMaterial;
            var sLayout = oEvent.getParameter("arguments").layout;

            this.getView().getModel().setProperty("/busy", false);

            this.getView().getModel("layoutModel").setProperty("/layout", sLayout);

            //added
            var oSelectedKeyModel = new JSONModel();
            this.getView().setModel(oSelectedKeyModel, "oSelectedKeyModel");

            if (this.sParentID === "new") {
                //added
                var items = {selectedItems : []}
                this.getView().getModel("oSelectedKeyModel").setData(items);

                this.getViewModel("objectViewModel").setProperty("/idSFDisplay", false);
                this.getViewModel("objectViewModel").setProperty("/idSFEdit", true);

                this.getViewModel("objectViewModel").setProperty("/showFooter", true);
                this.getViewModel("objectViewModel").setProperty("/idBtnDelete", false);
                this.getViewModel("objectViewModel").setProperty("/idBtnEdit", false);
                this.getViewModel("objectViewModel").setProperty("/idBtnSave", true);
                this.getViewModel("objectViewModel").setProperty("/idBtnCancel", true);
                this.mainModel.setDeferredBatchGroups(["createGroup"]);


                this._oNewContext = this.mainModel.createEntry("/MasterBoQItemSet", {
                    groupId: "createGroup",
                    properties: {
                        ID: "",
                        Name: "",
                        Description: "",
                        MaterialCode:"",
                        UOMs: []
                    }
                });
                this._oObjectPath = this._oNewContext.sPath;
                //this.getView().setBindingContext(this._oNewContext);
                this.getView().bindElement({
                    path: this._oObjectPath
                });
            } else {
                //added
                this.getSelectedKeys(this.sParentID);

                this.getViewModel("objectViewModel").setProperty("/showFooter", false);
                this.getViewModel("objectViewModel").setProperty("/idBtnDelete", true);
                this._bindView("/MasterBoQItemSet" + this.sParentID);
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

        //added
        getSelectedKeys: function (sParentID) {
            var sReadPath = "/MasterBoQItemSet" + sParentID + "/UOMs"
            this.getComponentModel().read(sReadPath, {
                success: function(oData ,oResponse){
                    var aData = oData.results;
                    if(aData.length){
                        var selectedKeys = [];
                        for(var i =0 ; i<aData.length;i++){
                            selectedKeys.push(aData[i].MasterUOMId);
                        }
                        var items = {selectedItems : [selectedKeys]}
                        this.getView().getModel("oSelectedKeyModel").setData(items);
                    }
                }.bind(this),
                error: function(oError){
                    sap.m.MessageBox.error(JSON.stringify(oError));
                }
            });
        },

        onEdit: function () {
            this.getViewModel("objectViewModel").setProperty("/showFooter", true);
            this.getViewModel("objectViewModel").setProperty("/idBtnEdit", false);
            this.getViewModel("objectViewModel").setProperty("/idBtnSave", true);
            this.getViewModel("objectViewModel").setProperty("/idBtnCancel", true);

            this.getViewModel("objectViewModel").setProperty("/idSFDisplay", false);
            this.getViewModel("objectViewModel").setProperty("/idSFEdit", true);

        },

        onSave: function () {
            var that = this;
            var oPayload = {};
            var arr = [];
            var name = this.byId("nameEdit").getValue();
            var description = this.byId("nameDesc").getValue();
            var materialCode = this.byId("mcodeEdit").getValue();
            if (name == "") {
                sap.m.MessageBox.error("Please enter Name ! ");
                return;
            }
            else if (description == "") {
                sap.m.MessageBox.error("Please enter Description ! ");
                return;
            }
            else if (materialCode == "") {
                sap.m.MessageBox.error("Please enter Material Code ! ");
                return;
            }
            oPayload.Name = name;
            oPayload.Description = description;
            oPayload.MaterialCode = materialCode;
            // oPayload.MaterialCode = "123";
            var selectedData = this.byId("uomEdit").getSelectedItems();
            for (var i = 0; i < selectedData.length; i++) {
                var obj = {};
                obj.Name = selectedData[i].getProperty("text");
                obj.MasterUOMId = selectedData[i].getProperty("key");
                /*obj.MasterUOM = {
                    "__metadata": {
                        "uri": "MasterUOMSet(" + selectedData[i].getProperty("key") + ")"
                    }
                };*/
                arr.push(obj);
            }
            oPayload.UOMs = arr;
            if (this.sParentID === "new") {
                MessageBox.confirm("Do you want save this BOQ Item ?", {
                    icon: MessageBox.Icon.INFORMATION,
                    title: "Confirm",
                    actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                    emphasizedAction: MessageBox.Action.YES,
                    onClose: function (oAction) {
                        if (oAction == "YES") {
                            that.getComponentModel("app").setProperty("/busy", true);
                            that.mainModel.create("/MasterBoQItemSet", oPayload, {
                                success: function (oData, oResponse) {
                                    sap.m.MessageBox.success("BOQ Item Created Successfully");
                                    // sap.m.MessageBox.success(oData.Message);
                                    that.onCancel();
                                    that.getComponentModel("app").setProperty("/busy", false);
                                }.bind(this),
                                error: function (oError) {
                                    sap.m.MessageBox.error(JSON.stringify(oError));
                                    that.getComponentModel("app").setProperty("/busy", false);
                                }
                            });
                        }
                    }
                });
            }
            else {
                var sPath = this.getView().getBindingContext().getPath();
                that.getComponentModel("app").setProperty("/busy", true);
                that.mainModel.update(sPath, oPayload, {
                    success: function (oData, oResponse) {
                        sap.m.MessageBox.success("BOQ Item Updated Successfully");
                        // sap.m.MessageBox.success(oData.Message);
                        that.onCancel();
                        that.getComponentModel("app").setProperty("/busy", false);
                    }.bind(this),
                    error: function (oError) {
                        that.getComponentModel("app").setProperty("/busy", false);
                        sap.m.MessageBox.error(JSON.stringify(oError));
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
            var sPath = this.getView().getBindingContext().getPath();
            this.getComponentModel("app").setProperty("/busy", true);
            MessageBox.confirm("Do you want delete this BOQ Item ?", {
                icon: MessageBox.Icon.WARNING,
                title: "Confirm",
                actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                emphasizedAction: MessageBox.Action.YES,
                onClose: function (oAction) {
                    if (oAction == "YES") {
                        that.getComponentModel("app").setProperty("/busy", true);
                        that.mainModel.remove(sPath, {
                            success: function (oData, oResponse) {
                                sap.m.MessageBox.success("UOM Deleted Successfully");
                                // sap.m.MessageBox.success(oData.Message);
                                that.onCancel();
                                that.onNavigateToMaster();
                                that.getComponentModel("app").setProperty("/busy", false);
                            }.bind(this),
                            error: function (oError) {
                                that.getComponentModel("app").setProperty("/busy", false);
                                sap.m.MessageBox.error(JSON.stringify(oError));
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
        }

    });
});            
