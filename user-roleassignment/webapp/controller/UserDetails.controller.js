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
                Role: null,
                UnassignRoleList: [],
                UserID: null
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
            this.getView().getModel("objectViewModel").setProperty("/UserID", sObjectId);
            this._bindView("/UserSet" + sObjectId);
        },

        _bindView: function (sObjectPath) {
            var objectViewModel = this.getViewModel("objectViewModel");
            this.fnGetUserRoles(sObjectPath);
            this.fnGetMasterRoles();

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

        fnGetUserRoles: function (sObjectPath) {
            this.getView().getModel().read(sObjectPath, {
                urlParameters: {
                    $expand: "UserRoles,UserRoles/Role"
                },
                success: function (oResponse) {
                    var oApprovedUserRolesModel = new JSONModel(oResponse.UserRoles.results);
                    this.getView().setModel(oApprovedUserRolesModel, "ApprovedUserRolesModel");
                }.bind(this),
                error: function (oError) {
                }.bind(this)
            });
        },

        fnGetMasterRoles: function () {
            this.getView().getModel().read("/MasterRoleSet", {
                success: function (oResponse) {
                    var oMasterRoleSetModel = new JSONModel(oResponse.results);
                    this.getView().setModel(oMasterRoleSetModel, "MasterRoleSetModel");
                }.bind(this),
                error: function (oError) {
                }.bind(this)
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

                oDetails.view.byId("idSaveNewRoleBTN").setEnabled(false);
                oDetails.controller.fnSetUnassignedRolesList(oDetails.view);
            });
        },

        fnSetUnassignedRolesList: function (oView) {
            var aExistingApprovedRoles = oView.getModel("ApprovedUserRolesModel").getProperty("/"),
                aMasterRoles = oView.getModel("MasterRoleSetModel").getProperty("/"),
                UnassignedRoles = [];

            for (var i = 0; i < aMasterRoles.length; i++) {
                var iIndex = aExistingApprovedRoles.findIndex(function (oRole) {
                    return oRole.Role.Role === aMasterRoles[i].Role;
                });

                if (iIndex < 0) {
                    UnassignedRoles.push(aMasterRoles[i]);
                }
            }

            oView.getModel("objectViewModel").setProperty("/UnassignRoleList", UnassignedRoles);
            oView.getModel("objectViewModel").refresh();
        },

        onClose: function () {
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

            this.onClose();
            this.getComponentModel().create("/UserRoleAssignmentSet", aPayload, {
                success: function () {
                    this.getView().setBusy(false);
                    MessageBox.success(this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("UserRoleAssignedSuccess"));
                    var sUserID = this.getView().getModel("objectViewModel").getProperty("/UserID");

                    this.fnGetUserRoles("/UserSet" + sUserID);

                    this.getView().getElementBinding().refresh();
                }.bind(this),
                error: function (oError) {
                    this.getView().setBusy(false);
                  //  MessageBox.error(JSON.stringify(oError));
                }.bind(this)
            });

            this.getView().byId("roleEdit").setSelectedKeys([]);
        },

        onRoleSelectionFinish: function (oEvent) {
            var aSelectedRoleKeys = oEvent.getSource().getSelectedKeys();
            if (aSelectedRoleKeys.length > 0)
                this.getView().byId("idSaveNewRoleBTN").setEnabled(true);
            else
                this.getView().byId("idSaveNewRoleBTN").setEnabled(false);
        }
    });
});