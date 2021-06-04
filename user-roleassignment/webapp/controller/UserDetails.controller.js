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

    return BaseController.extend("com.agel.mmts.userroleassignment.controller.UserDetails", {

        onInit: function () {
            this.getView().addEventDelegate({
                onAfterShow: this.onBeforeShow,
            }, this);
            //view model instatiation
            var oViewModel = new JSONModel({
                busy: false,
                delay: 0,
                boqSelection: null,
                idBtnEdit: true,
                idBtnSave: false,
                idBtnCancel: false,
                showFooter: false
            });
            this.setModel(oViewModel, "objectViewModel");

            // this._createBOQApprovalModel();

            // Keeps reference to any of the created sap.m.ViewSettingsDialog-s in this sample
            this._mViewSettingsDialogs = {};

            //Router Object
            this.oRouter = this.getRouter();
            this.oRouter.getRoute("RouteUserRoleDetailPage").attachPatternMatched(this._onObjectMatched, this);
        },

        _onObjectMatched: function (oEvent) {
            var sObjectId = oEvent.getParameter("arguments").BOQRequestId;
            this._bindView("/UserSet" + sObjectId);
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
        },

        onCancel: function () {
            this.getViewModel("objectViewModel").setProperty("/idBtnEdit", true);
            this.getViewModel("objectViewModel").setProperty("/idBtnSave", false);
            this.getViewModel("objectViewModel").setProperty("/idBtnCancel", false);
            this.getViewModel("objectViewModel").setProperty("/showFooter", false);
        },

        // _createBOQApprovalModel: function () {

        //     var oModel = new JSONModel({
        //         BOQApprovedRequestId: null,
        //         Status: null,
        //         Comment: null,
        //         BOQGroupId: null,
        //         isPostButtonEnabled: false,
        //         Label: null
        //     });

        //     this.setModel(oModel, "BOQApprovalModel");
        // },

        // onChildTableUpdateStarted: function (oEvent) {
        //     oEvent.getSource().setBusy(true);
        // },

        // onChildItemsTableUpdateFinished: function (oEvent) {
        //     oEvent.getSource().setBusy(false);
        // },

        // onViewChildItemPress: function (oEvent) {
        //     var oItem = oEvent.getSource();
        //     var that = this;
        //     var sPath = oEvent.getSource().getParent().getBindingContextPath();
        //     that.handleChildItemsDialogOpen(sPath);
        // },

        // handleChildItemsDialogOpen: function (sParentItemPath) {
        //     var oDetails = {};
        //     oDetails.controller = this;
        //     oDetails.view = this.getView();
        //     oDetails.sParentItemPath = sParentItemPath;
        //     if (!this.pDialog) {
        //         this.pDialog = Fragment.load({
        //             id: oDetails.view.getId(),
        //             name: "com.agel.mmts.vendorPersona.view.fragments.PODetails.ChildItemsDialog",
        //             controller: oDetails.controller
        //         }).then(function (oDialog) {
        //             oDetails.view.addDependent(oDialog);
        //             oDialog.bindElement({
        //                 path: oDetails.sParentItemPath,
        //                 parameters: {
        //                     "expand": 'child_line_items'
        //                 }
        //             });
        //             return oDialog;
        //         });
        //     }
        //     this.pDialog.then(function (oDialog) {
        //         oDetails.view.addDependent(oDialog);
        //         oDialog.bindElement({
        //             path: oDetails.sParentItemPath,
        //             parameters: {
        //                 "expand": 'child_line_items'
        //             }
        //         });
        //         oDialog.open();
        //     });
        // },

        // onViewChildDialogClose: function (oEvent) {
        //     this.pDialog.then(function (oDialog) {
        //         oDialog.close();
        //     });
        // },

        // getViewSettingsDialog: function (sDialogFragmentName) {
        //     var pDialog = this._mViewSettingsDialogs[sDialogFragmentName];

        //     if (!pDialog) {
        //         pDialog = Fragment.load({
        //             id: this.getView().getId(),
        //             name: sDialogFragmentName,
        //             controller: this
        //         }).then(function (oDialog) {
        //             if (Device.system.desktop) {
        //                 oDialog.addStyleClass("sapUiSizeCompact");
        //             }
        //             return oDialog;
        //         });
        //         this._mViewSettingsDialogs[sDialogFragmentName] = pDialog;
        //     }
        //     return pDialog;
        // },

        // BOQApproval: function (oEvent) {
        //     var BOQApprovedRequestId = this.getView().getBindingContext().getObject().ID;
        //     var boqApprovalModel = this.getViewModel("BOQApprovalModel");

        //     if (BOQApprovedRequestId) {
        //         boqApprovalModel.setProperty("/Label", "Please enter your approval comments.");
        //         boqApprovalModel.setProperty("/BOQApprovedRequestId", BOQApprovedRequestId);
        //         boqApprovalModel.setProperty("/Status", "APPROVED");
        //     }

        //     if (!this._oBOQApprovalDialog) {
        //         this._oBOQApprovalDialog = sap.ui.xmlfragment("com.agel.mmts.tcengineer.view.fragments.BOQDetails.BOQCommentGetter", this);
        //         this.getView().addDependent(this._oBOQApprovalDialog);
        //     }
        //     this._oBOQApprovalDialog.open();
        // },

        // onCommentLiveChange: function (oEvent) {
        //     var boqApprovalModel = this.getViewModel("BOQApprovalModel");
        //     if (oEvent.getSource().getValue().length > 0)
        //         boqApprovalModel.setProperty("/isPostButtonEnabled", true);
        //     else
        //         boqApprovalModel.setProperty("/isPostButtonEnabled", false);
        // },

        // onPostButtonPress: function (oEvent) {
        //     this._oBOQApprovalDialog.close();
        //     var oData = this.getViewModel("BOQApprovalModel").getData();
        //     var boqApprovalModel = this.getViewModel("BOQApprovalModel");

        //     var aPayload = {
        //         "Responses": [{
        //             "BOQApprovedRequestId": boqApprovalModel.getProperty("/BOQApprovedRequestId"),
        //             "Status": boqApprovalModel.getProperty("/Status"),
        //             "Comment": boqApprovalModel.getProperty("/Comment")
        //         }]
        //     };


        //     this.getComponentModel().create("/TCBOQResponseSet", aPayload, {
        //         success: function (oData, oResponse) {
        //             if(oData.Success)
        //             sap.m.MessageBox.success(oData.Message);
        //             else
        //             sap.m.MessageBox.error(oData.Message);  
        //             this.getComponentModel().refresh();
        //         }.bind(this),
        //         error: function (oError) {
        //             sap.m.MessageBox.success(JSON.stringify(oError));
        //         }
        //     })

        // },

        // onRejectBOQPress: function (oEvent) {
        //     var BOQApprovedRequestId = this.getView().getBindingContext().getObject().ID;
        //     var BOQGroupId = oEvent.getSource().getBindingContext().getObject().BOQGroupId;
        //     var boqApprovalModel = this.getViewModel("BOQApprovalModel");

        //     if (BOQGroupId) {
        //         boqApprovalModel.setProperty("/Label", "Please enter reason for rejection.");
        //         boqApprovalModel.setProperty("/BOQApprovedRequestId", BOQApprovedRequestId);
        //         boqApprovalModel.setProperty("/BOQGroupId", BOQGroupId);
        //         boqApprovalModel.setProperty("/Status", "REJECTED");
        //     }

        //     if (!this._oBOQApprovalDialog) {
        //         this._oBOQApprovalDialog = sap.ui.xmlfragment("com.agel.mmts.tcengineer.view.fragments.BOQDetails.BOQCommentGetter", this);
        //         this.getView().addDependent(this._oBOQApprovalDialog);
        //     }
        //     this._oBOQApprovalDialog.open();
        // },

        // onCancelBOQApprovalProcess: function (oEvent) {
        //     this._oBOQApprovalDialog.close();
        // }

    });
});