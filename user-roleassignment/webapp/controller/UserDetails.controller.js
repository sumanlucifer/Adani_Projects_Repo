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
                ID: null,
                Role: null
            });
            this.setModel(oViewModel, "objectViewModel");

            // Keeps reference to any of the created sap.m.ViewSettingsDialog-s in this sample
            this._mViewSettingsDialogs = {};

            //Router Object
            this.oRouter = this.getRouter();
            this.oRouter.getRoute("RouteUserRoleDetailPage").attachPatternMatched(this._onObjectMatched, this);
        },

        _onObjectMatched: function (oEvent) {
            var sObjectId = oEvent.getParameter("arguments").BOQRequestId;
            this._bindView("/UserSet" + sObjectId);


            // var oSelectedKeyModel = new JSONModel();
            // this.getView().setModel(oSelectedKeyModel, "oSelectedKeyModel");
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

        onRoleDialogPress: function (oEvent) {
            var sParentItemPath = oEvent.getSource().getParent().getBindingContext().getPath();
            var sDialogTitle = "Name: " + oEvent.getSource().getBindingContext().getObject().FirstName + " " + oEvent.getSource().getBindingContext().getObject().LastName;
            var oDetails = {};
            oDetails.controller = this;
            oDetails.view = this.getView();
            oDetails.sParentItemPath = sParentItemPath;
            oDetails.title = sDialogTitle;
            if (!this.pDialog) {
                this.pDialog = Fragment.load({
                    id: oDetails.view.getId(),
                    name: "com.agel.mmts.userroleassignment.view.fragments.AssignRole.AssignRoleDialog",
                    controller: oDetails.controller
                }).then(function (oDialog) {
                    // connect dialog to the root view of this component (models, lifecycle)
                    oDetails.view.addDependent(oDialog);
                    oDialog.bindElement({
                        path: oDetails.sParentItemPath
                    });
                    oDialog.setTitle(oDetails.title);
                    return oDialog;
                });
            }
            this.pDialog.then(function (oDialog) {
                oDetails.view.addDependent(oDialog);
                oDialog.bindElement({
                    path: oDetails.sParentItemPath
                });
                oDialog.setTitle(oDetails.title);
                oDialog.addStyleClass("sapUiSizeCompact");
                oDialog.open();
            });
        },

        onClose: function (oEvent) {
            this.pDialog.then(function (oDialog) {
                oDialog.close();
            });
        },

        onSave: function (oEvent) {
            var that = this;
            var Roles = [];
            var oBOQGroupSelected = oEvent.getSource().getBindingContext().getObject();
            var userID = parseInt(oBOQGroupSelected.ID);
            var sRoleId = this.getView().byId("roleEdit").getSelectedKeys();
            sRoleId = sRoleId.map(function (item) {
                return {
                    RoleId: parseInt(item)
                };
            });

            var aPayload = {
                "UserId": userID,
                "Roles": sRoleId
            };
            // debugger;
            this.getComponentModel().create("/UserRoleAssignmentSet", aPayload, {
                success: function (oData, oResponse) {
                    sap.m.MessageBox.success("User Role Assigned");
                    this.getComponentModel().refresh();
                    that.onClose();
                }.bind(this),
                error: function (oError) {
                    sap.m.MessageBox.error(JSON.stringify(oError));
                    that.onClose();
                }
            })
        }
    });
});