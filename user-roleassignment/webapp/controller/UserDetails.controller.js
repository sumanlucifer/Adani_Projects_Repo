sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment",
    "sap/m/MessageBox"
], function (BaseController, JSONModel, Fragment, MessageBox) {
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
        },

        _bindView: function (sObjectPath) {
            var objectViewModel = this.getViewModel("objectViewModel");

            this.getView().bindElement({
                path: sObjectPath,
                events: {
                    dataRequested: function () {
                        objectViewModel.setProperty("/busy", true);
                    },
                    dataReceived: function (oData) {
                        objectViewModel.setProperty("/busy", false);
                    }
                }
            });
        },

        onRoleDialogPress: function (oEvent) {
            var sParentItemPath = oEvent.getSource().getParent().getBindingContext().getPath(),
                sFirstName = oEvent.getSource().getBindingContext().getObject().FirstName,
                sLastName = oEvent.getSource().getBindingContext().getObject().LastName,
                sDialogTitle = "Name: " + (sFirstName ? sFirstName : "") + " " + (sLastName ? sLastName : ""),
                oDetails = {};

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
            this.getView().byId("roleEdit").setSelectedKeys([]);
        },

        onSave: function (oEvent) {
            this.getView().setBusy(true);

            var oBOQGroupSelected = oEvent.getSource().getBindingContext().getObject(),
                userID = parseInt(oBOQGroupSelected.ID),
                aRoleId = this.getView().byId("roleEdit").getSelectedKeys();

            aRoleId = aRoleId.map(function (item) {
                return {
                    RoleId: parseInt(item)
                };
            });

            var aPayload = {
                "UserId": userID,
                "Roles": aRoleId
            };

            this.getComponentModel().create("/UserRoleAssignmentSet", aPayload, {
                success: function (oResponse) {
                    this.getView().setBusy(false);
                    if (oResponse.Success)
                        MessageBox.success(oResponse.Message);
                    else
                        MessageBox.error(oResponse.Message);

                    this.getView().getElementBinding().refresh(true);
                    this.onClose();
                }.bind(this),
                error: function (oError) {
                    this.getView().setBusy(false);
                    MessageBox.error(JSON.stringify(oError));
                    this.onClose();
                }.bind(this)
            });

            this.getView().byId("roleEdit").setSelectedKeys([]);
        },

        onLoadUserRoles: function (oEvent) {

        }
    });
});