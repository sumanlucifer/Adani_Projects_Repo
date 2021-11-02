sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Fragment",
    "sap/m/MessageBox",
    "sap/m/MessageToast"
], function (Controller, Fragment, MessageBox, MessageToast) {
    "use strict";

    return Controller.extend("com.agel.mmts.selfroleassignment.view.blocks.UserDetails.basicDetails.BasicDetailsController", {

        onRoleDialogPress: function (oEvent) {
            //     this.oParentBlock.fireOnRoleDialogPress(oEvent);
            var sFirstName = this.getView().getModel("UserDetailModel").getProperty("/FirstName"),
                sLastName = this.getView().getModel("UserDetailModel").getProperty("/LastName"),
                oDetails = {};

            oDetails.controller = this;
            oDetails.view = this.getView();
            oDetails.title = "Name: " + sFirstName + " " + sLastName;

            if (!this.pDialog) {
                this.pDialog = Fragment.load({
                    id: oDetails.view.getId(),
                    name: "com.agel.mmts.selfroleassignment.view.fragments.AssignRole.AssignRoleDialog",
                    controller: oDetails.controller
                }).then(function (oDialog) {
                    oDetails.view.addDependent(oDialog);
                    oDialog.setTitle(oDetails.title);
                    return oDialog;
                });
            }
            this.pDialog.then(function (oDialog) {
                oDetails.view.addDependent(oDialog);
                oDialog.setTitle(oDetails.title);
                oDialog.addStyleClass("sapUiSizeCompact");
                oDialog.open();
            });
        },

        onClose: function (oEvent) {
            this.pDialog.then(function (oDialog) {
                this.getView().byId("roleEdit").setSelectedKeys([]);
                this.getView().byId("idSaveBTN").setEnabled(false);
                oDialog.close();
            }.bind(this));
        },

        onNewUserRoleSelected: function (oEvent) {
            var aUserExistingRoles = this.getView().getModel("UserDetailModel").getProperty("/UserRoles"),
                sNewSelectedRoleId = oEvent.getParameters().changedItem.getKey(),
                sNewSelectedRoleName = oEvent.getParameters().changedItem.getText(),
                iDuplicateRoleIndex = aUserExistingRoles.findIndex(function (oRoleItem) {
                    return oRoleItem.Role.ID === sNewSelectedRoleId;
                }),
                aSelectedRolesIds = oEvent.getSource().getSelectedKeys();

            if (iDuplicateRoleIndex >= 0) {
                MessageToast.show("You already have access to  " + sNewSelectedRoleName + " Role.");
                var iItemToBeUnselectIndex = aSelectedRolesIds.findIndex(function (oItem) {
                    return oItem === sNewSelectedRoleId;
                });

                aSelectedRolesIds.splice(iItemToBeUnselectIndex, 1);
                oEvent.getSource().setSelectedKeys(aSelectedRolesIds);
            }

            if (aSelectedRolesIds.length > 0) {
                this.getView().byId("idSaveBTN").setEnabled(true);
            }
            else {
                this.getView().byId("idSaveBTN").setEnabled(false);
            }
        },

        onSave: function (oEvent) {
            var userID = Number(this.getView().getModel("UserDetailModel").getProperty("/ID")),
                sUserName = this.getView().getModel("UserDetailModel").getProperty("/FirstName"),
                aSelectedRolesIDs = this.getView().byId("roleEdit").getSelectedKeys();

            aSelectedRolesIDs = aSelectedRolesIDs.map(function (item) {
                return {
                    RoleId: parseInt(item)
                };
            });

            var oUserRoleRequestObj = {
                "UserId": userID,
                "UserName": sUserName,
                "UpdateRequestFlag": false,
                "Roles": aSelectedRolesIDs
            };

            this.getView().getModel().create("/RoleAssignApprovalRequestEdmSet", oUserRoleRequestObj, {
                success: function () {
                    MessageBox.success("Request for new user role submitted successfully.");
                    this.getView().getModel().refresh();
                    this.onClose();
                }.bind(this),
                error: function (oError) {
                    MessageBox.error(JSON.stringify(oError));
                    this.onClose();
                }.bind(this)
            });
        }
    });
});
