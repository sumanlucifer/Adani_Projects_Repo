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
                idBtnDelete: true,
                showFooter:false,
                idSFEdit: false,
                idBtnEdit: true,
                idBtnSave: false,
                idBtnCancel: false
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

            if (this.sParentID === "new") {

                this.getViewModel("objectViewModel").setProperty("/idSFDisplay", false);
                this.getViewModel("objectViewModel").setProperty("/idSFEdit", true);
                this.getViewModel("objectViewModel").setProperty("/showFooter", true);
                this.getViewModel("objectViewModel").setProperty("/idBtnDelete", false);
                this.getViewModel("objectViewModel").setProperty("/idBtnEdit", false);
                this.getViewModel("objectViewModel").setProperty("/idBtnSave", true);
                this.getViewModel("objectViewModel").setProperty("/idBtnCancel", true);
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
                this.getViewModel("objectViewModel").setProperty("/showFooter", false);
                this.getViewModel("objectViewModel").setProperty("/idBtnDelete", true);
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
            var Name = this.byId("nameEdit").getValue();
            var Description = this.byId("nameDesc").getValue();
            if ( Name == "" ){
                sap.m.MessageBox.error("Please enter name ");
                return;
            }   
            if ( Description == "" ){
                sap.m.MessageBox.error("Please enter description ");
                return;
            }        
            oPayload.Name = Name;
            oPayload.Description = Description;

            if (this.sParentID === "new") {
                MessageBox.confirm("Do you want crate new packing list type ?",{
				    icon: MessageBox.Icon.INFORMATION,
				    title: "Confirm",
				    actions: [MessageBox.Action.YES, MessageBox.Action.NO],
				    emphasizedAction: MessageBox.Action.YES,
				    onClose: function (oAction) { 
                        if ( oAction == "YES" ){
                        that.getComponentModel("app").setProperty("/busy", true);
                         this.mainModel.create("/MasterUOMSet", oPayload, {
                            success: function (oData, oResponse) {
                                sap.m.MessageBox.success("UOM Created Successfully");
                                that.getComponentModel("app").setProperty("/busy", false);
                                that.onCancel();
                            }.bind(this),
                            error: function (oError) {
                                that.getComponentModel("app").setProperty("/busy", false);
                                sap.m.MessageBox.error(JSON.stringify(oError));
                             }
                            });
                        }
                    }
			    });
            }
            else{        
                MessageBox.confirm("Do you want to update UOM type ?",{
				    icon: MessageBox.Icon.INFORMATION,
				    title: "Confirm",
				    actions: [MessageBox.Action.YES, MessageBox.Action.NO],
				    emphasizedAction: MessageBox.Action.YES,
				    onClose: function (oAction) { 
                        if ( oAction == "YES" ){
                            var sPath = that.getView().getBindingContext().getPath();
                            that.getComponentModel("app").setProperty("/busy", true);
                            that.mainModel.update(sPath, oPayload, {
                                success: function (oData, oResponse) {
                                sap.m.MessageBox.success("UOM Updated Successfully");
                                that.getComponentModel("app").setProperty("/busy", false);
                                that.getView().getModel().refresh();
                                that.onCancel();
                            }.bind(this),
                                error: function (oError) {
                                    that.getComponentModel("app").setProperty("/busy", false);
                                    sap.m.MessageBox.error(JSON.stringify(oError));
                               }
                            });
                        }
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

        // On Delete Press Button
        onDeletePress : function(oEvent){
            var that=this;
            var sPath = this.getView().getBindingContext().getPath();
            MessageBox.confirm("Do you want delete UOM type ?",{
				    icon: MessageBox.Icon.WARNING,
				    title: "Confirm",
				    actions: [MessageBox.Action.YES, MessageBox.Action.NO],
				    emphasizedAction: MessageBox.Action.YES,
				    onClose: function (oAction) { 
                        if ( oAction == "YES" ){
                            that.getComponentModel("app").setProperty("/busy", true);
                            that.mainModel.remove(sPath, {
                                success: function (oData, oResponse) {
                                    // sap.m.MessageBox.success(oData.Message);
                                    that.getComponentModel("app").setProperty("/busy", false);
                                    sap.m.MessageBox.success("UOM Deleted Successfully");
                                    // this.getViewModel("objectViewModel").setProperty("/isCreatingPCList", false);
                                    //   this.getView().getModel().refresh();
                                    that.onCancel();
                                    that.onNavigateToMaster();
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
        onNavigateToMaster : function(){
                this.oRouter.navTo("LandingPage", {
                },
                false
                );
        }

    });
});            
