sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/Fragment",
    "sap/ui/model/Sorter",
    "sap/ui/Device",
    "sap/ui/core/routing/History",
    'sap/m/ColumnListItem',
    'sap/m/Input',
    'sap/base/util/deepExtend',
    'sap/ui/export/Spreadsheet',
    'sap/m/MessageToast',
    "sap/m/MessageBox",
    "sap/m/ObjectIdentifier",
    "sap/m/Text",
    "sap/m/Button"
], function (BaseController, JSONModel, Filter, FilterOperator, Fragment, Sorter, Device, History, ColumnListItem, Input, deepExtend, Spreadsheet, MessageToast, MessageBox, ObjectIdentifier, Text, Button) {
    "use strict";

    return BaseController.extend("com.agel.mmts.pmcg.controller.TCEngDetail", {

        onInit: function () {
            this.getView().addEventDelegate({
                onAfterShow: this.onBeforeShow,
            }, this);
            //view model instatiation
            var oViewModel = new JSONModel({
                busy: false,
                delay: 0,
                boqSelection: null
            });
            this.setModel(oViewModel, "objectViewModel");
            
            this.MainModel = this.getOwnerComponent().getModel();
            this.getView().setModel(this.MainModel);

            this._createBOQApprovalModel();

            // Keeps reference to any of the created sap.m.ViewSettingsDialog-s in this sample
            this._mViewSettingsDialogs = {};

            //Router Object
            this.oRouter = this.getRouter();
            this.oRouter.getRoute("TCEngDetailPage").attachPatternMatched(this._onObjectMatched, this);
        },

        _onObjectMatched: function (oEvent) {
            // var sObjectId = oEvent.getParameter("arguments").TCEngId;

            var sObjectId = oEvent.getParameter("arguments").TCEngId;
            this.sObjectId =sObjectId;
 
            // this._bindView("/MDCCSet(" + sObjectId +")");
            this._bindView("/MDCCStatusSet(" + sObjectId +")/MDCC");
            this._getParentDataViewMDCC(sObjectId);
        },

        _createBOQApprovalModel: function () {

            var oModel = new JSONModel({
                ID: null,
                Status: null,
                Comment: null,
                MDCCID: null,
                isPostButtonEnabled: false,
                UpdatedAt: null,
                UpdatedBy: null,
                ApprovedOn: null,
                ApprovedBy:null

            });

            this.setModel(oModel, "BOQApprovalModel");
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

        onChildTableUpdateStarted: function (oEvent) {
            oEvent.getSource().setBusy(true);
        },

        onChildItemsTableUpdateFinished: function (oEvent) {
            oEvent.getSource().setBusy(false);
        },


        onViewChildItemPress: function (oEvent) {
            var oItem = oEvent.getSource();
            var that = this;
            var sPath = oEvent.getSource().getParent().getBindingContextPath();
            that.handleChildItemsDialogOpen(sPath);
        },

        // Child Line Items Dialog Open
        handleChildItemsDialogOpen: function (sParentItemPath) {
            // create dialog lazily
            var oDetails = {};
            oDetails.controller = this;
            oDetails.view = this.getView();
            oDetails.sParentItemPath = sParentItemPath;
            if (!this.pDialog) {
                this.pDialog = Fragment.load({
                    id: oDetails.view.getId(),
                    name: "com.agel.mmts.vendorPersona.view.fragments.PODetails.ChildItemsDialog",
                    controller: oDetails.controller
                }).then(function (oDialog) {
                    // connect dialog to the root view of this component (models, lifecycle)
                    oDetails.view.addDependent(oDialog);
                    oDialog.bindElement({
                        path: oDetails.sParentItemPath,
                        parameters: {
                            "expand": 'child_line_items'
                        }
                    });
                    return oDialog;
                });
            }
            this.pDialog.then(function (oDialog) {
                oDetails.view.addDependent(oDialog);
                oDialog.bindElement({
                    path: oDetails.sParentItemPath,
                    parameters: {
                        "expand": 'child_line_items'
                    }
                });
                oDialog.open();
            });
        },

        onViewChildDialogClose: function (oEvent) {
            this.pDialog.then(function (oDialog) {
                oDialog.close();
            });
        },

        getViewSettingsDialog: function (sDialogFragmentName) {
            var pDialog = this._mViewSettingsDialogs[sDialogFragmentName];

            if (!pDialog) {
                pDialog = Fragment.load({
                    id: this.getView().getId(),
                    name: sDialogFragmentName,
                    controller: this
                }).then(function (oDialog) {
                    if (Device.system.desktop) {
                        oDialog.addStyleClass("sapUiSizeCompact");
                    }
                    return oDialog;
                });
                this._mViewSettingsDialogs[sDialogFragmentName] = pDialog;
            }
            return pDialog;
        },

        onApproveBOQPress: function (oEvent) {
            var boqApprovalModel = this.getViewModel("BOQApprovalModel");
            var obj=oEvent.getSource().getBindingContext().getObject();
            var patt1 = /[0-9]/g;
            var sObject =this.sObjectId;
            var mDCCID = parseInt(sObject.match(patt1));
            var iD = obj.ID;
            var updatedAt = obj.UpdatedAt;
            var updatedBy = obj.UpdatedBy;
            var approvedBy = obj.ApprovedBy;
            var approvedAt = obj.ApprovedAt;

            if (mDCCID) {
                boqApprovalModel.setProperty("/Label", "Please enter your approval comments.");
                boqApprovalModel.setProperty("/ID", iD);
                boqApprovalModel.setProperty("/MDCCID", mDCCID);
                boqApprovalModel.setProperty("/Status", "APPROVED");
                boqApprovalModel.setProperty("/UpdatedAt", new Date());
                boqApprovalModel.setProperty("/UpdatedBy", updatedBy);
                boqApprovalModel.setProperty("/ApprovedBy", approvedBy);
                boqApprovalModel.setProperty("/ApprovedAt", approvedAt);
            }

            if (!this._oBOQApprovalDialog) {
                this._oBOQApprovalDialog = sap.ui.xmlfragment("com.agel.mmts.pmcg.view.fragments.BOQDetails.BOQCommentGetter", this);
                this.getView().addDependent(this._oBOQApprovalDialog);
            }
            this._oBOQApprovalDialog.open();
        },

        onCommentLiveChange: function (oEvent) {
            var boqApprovalModel = this.getViewModel("BOQApprovalModel");
            if (oEvent.getSource().getValue().length > 0)
                boqApprovalModel.setProperty("/isPostButtonEnabled", true);
            else
                boqApprovalModel.setProperty("/isPostButtonEnabled", false);
        },

        onReadId : function(){
            var that = this;
            // this.getComponentModel().read("/MDCCSet(" + this.sObjectId +")/MDCCStatuses", {
            this.getComponentModel().read("/MDCCStatusSet(" + this.sObjectId +")/MDCC/MDCCStatuses", {
                success: function (oData, oResponse) {
                   that.onPostButtonPress(oData.results[0].ID);
                }.bind(this),
                error: function (oError) {
                    sap.m.MessageBox.success(JSON.stringify(oError));
                }
            })
        },

        onPostButtonPress: function (MDCCStatusSetID) {
            this._oBOQApprovalDialog.close();
            var oData = this.getViewModel("BOQApprovalModel").getData();
            var boqApprovalModel = this.getViewModel("BOQApprovalModel");
            var patt1 = /[0-9]/g;
            var sObject = this.sObjectId;
         //   var sObjectId = parseInt(sObject.match(patt1));
            var sObjectId = sObject;

            var aPayload = 
            // {"Responses": 
                {
                    "ID": MDCCStatusSetID,
                    "Status": boqApprovalModel.getProperty("/Status"),
                    "Comment": boqApprovalModel.getProperty("/Comment"),
                    "MDCCID": boqApprovalModel.getProperty("/ID"),
                    "UpdatedAt": new Date(),
                    "UpdatedBy": boqApprovalModel.getProperty("/UpdatedBy"),
                    "ApprovedOn": new Date(),
                    "ApprovedBy": boqApprovalModel.getProperty("/ApprovedBy")
                };
            // };

            this.getComponentModel().update("/MDCCStatusSet(" + MDCCStatusSetID +")", aPayload, {
                success: function (oData, oResponse) {
                    var message;
                    if ( aPayload.Status === "APPROVED"){
                        message = "MDCC request has been Approved successfully!";
                    }else{
                         message = "MDCC request has been Rejected successfully!"
                    }
                     sap.m.MessageBox.success(message, {
                            title: "Success",
                            onClose: function (oAction1) {
                                if (oAction1 === sap.m.MessageBox.Action.OK) {
                                    this.getComponentModel().refresh();
                                }
                            }.bind(this)
                        });
                }.bind(this),
                error: function (oError) {
                    sap.m.MessageBox.success(JSON.stringify(oError));
                }
            })

        },

        onRejectBOQPress: function (oEvent) {
            var boqApprovalModel = this.getViewModel("BOQApprovalModel");
            var obj=oEvent.getSource().getBindingContext().getObject();
            var patt1 = /[0-9]/g;
            var sObject =this.sObjectId;
            var mDCCID = parseInt(sObject.match(patt1));
            var iD = obj.ID;
            var updatedAt = obj.UpdatedAt;
            var updatedBy = obj.UpdatedBy;
            var approvedBy = obj.ApprovedBy;
            var approvedAt = obj.ApprovedAt;

            if (mDCCID) {
                boqApprovalModel.setProperty("/Label", "Please enter reason for rejection.");
                boqApprovalModel.setProperty("/ID", iD);
                boqApprovalModel.setProperty("/MDCCID", mDCCID);
                boqApprovalModel.setProperty("/Status", "REJECTED");
                boqApprovalModel.setProperty("/UpdatedAt", new Date());
                boqApprovalModel.setProperty("/UpdatedBy", updatedBy);
                boqApprovalModel.setProperty("/ApprovedBy", approvedBy);
                boqApprovalModel.setProperty("/ApprovedAt", approvedAt);
            }

            if (!this._oBOQApprovalDialog) {
                this._oBOQApprovalDialog = sap.ui.xmlfragment("com.agel.mmts.pmcg.view.fragments.BOQDetails.BOQCommentGetter", this);
                this.getView().addDependent(this._oBOQApprovalDialog);
            }
            this._oBOQApprovalDialog.open();
        },

        onCancelBOQApprovalProcess: function (oEvent) {
            this._oBOQApprovalDialog.close();
        },
        		
		//---------------------------------------------Tree Table-------------------------------------------------------------//
        _arrangeData : function(){        
            var oModel = new JSONModel({"ChildItems":this.ParentData});
            this.getView().setModel(oModel,"TreeTableModel");
        },
        _getParentDataViewMDCC : function(sObjectId){
                var patt1 = /[0-9]/g;
                var sObject =sObjectId;
           //     sObjectId = parseInt(sObject.match(patt1));

                this.ParentDataView = [];
                // var sPath = "/MDCCSet("+sObjectId+")/MDCCParentLineItems";
                var sPath = "/MDCCStatusSet("+sObjectId+")/MDCC/MDCCParentLineItems";
                this.MainModel.read(sPath,{
                    success:function(oData,oResponse){
                        if(oData.results.length){
                            this._getChildItemsViewMDCC(oData.results, sObjectId);
                        }
                    }.bind(this),
                    error:function(oError){
                        sap.m.MessageBox.Error(JSON.stringify(oError));
                    }
                });
        },           
        _getChildItemsViewMDCC : function(ParentDataView, sObjectId){
            this.ParentDataView = ParentDataView;
            for( var i=0; i < ParentDataView.length; i++){
                // var sPath = "/MDCCSet("+sObjectId+")/MDCCParentLineItems("+ ParentDataView[i].ID +")/MDCCBOQItems";
                var sPath = "/MDCCStatusSet("+sObjectId+")/MDCC/MDCCParentLineItems("+ ParentDataView[i].ID +")/MDCCBOQItems";
                this.MainModel.read(sPath,{
                    success:function(i,oData,oResponse){
                        if(oData.results.length){
                            this.ParentDataView[i].isStandAlone=true;
                            this.ParentDataView[i].ChildItemsView=oData.results;
                        }
                        else{
                            this.ParentDataView[i].isStandAlone=false;
                            this.ParentDataView[i].ChildItemsView=[];
                        }
                        if(i==this.ParentDataView.length-1)
                            this._arrangeDataView();
                    }.bind(this,i),
                    error:function(oError){
                        sap.m.MessageBox.Error(JSON.stringify(oError));
                    }
                });
            }
        },
        _arrangeDataView : function(){        
                var that = this;
                var oModel = new JSONModel({"ChildItemsView":this.ParentDataView});
                this.getView().setModel(oModel,"TreeTableModelView");
               // var sPath = oEvent.getSource().getParent().getBindingContextPath();
               // sPath=  ;
               // that.handleViewDialogOpen();
               //debugger;
        }

    });
});