sap.ui.define(["sap/ui/core/mvc/Controller", "sap/ui/core/Fragment"], function (Controller, Fragment) {
    "use strict";

    return Controller.extend("com.agel.mmts.selfroleassignment.view.blocks.UserDetails.basicDetails.BasicDetailsController", {

        onRoleDialogPress: function (oEvent) {
            //     this.oParentBlock.fireOnRoleDialogPress(oEvent);
            var sFirstName = this.getView().getModel("UserDetailModel").getProperty("/FirstName"),
                sLastName = this.getView().getModel("UserDetailModel").getProperty("/LastName"),
                oDetails = {};

            oDetails.controller = this;
            oDetails.view = this.getView();
            oDetails.title = "Name: "+sFirstName+" "+sLastName;

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
                oDialog.close();
            }.bind(this));
        },

        onSave: function (oEvent) {
            var userID = Number(this.getView().getModel("UserDetailModel").getProperty("/ID")),
                sUserName = this.getView().getModel("UserDetailModel").getProperty("/FirstName"),
                aUserExistingRoles = this.getView().getModel("UserDetailModel").getProperty("/UserRoles"),
                aSelectedRolesIDs = this.getView().byId("roleEdit").getSelectedKeys(),
                sErrorMessage = "You already have access to below Roles \n",
                bErrorFound = false;

            for (var i = 0; i < aSelectedRolesIDs.length; i++) {
                var iIndex = aUserExistingRoles.findIndex(function (oRoleItem) {
                    return oRoleItem.Role.ID === aSelectedRolesIDs[i];
                });

                if (iIndex >= 0) {
                    sErrorMessage = sErrorMessage + "- " + aUserExistingRoles[iIndex].Role.RoleName + "\n";
                    bErrorFound = true;
                }
            }

            sErrorMessage = sErrorMessage + "Please remove existing role and select different roles."

            if (bErrorFound) {
                sap.m.MessageBox.error(sErrorMessage);
            } else {
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
                        sap.m.MessageBox.success("Request for new user role submitted successfully.");
                        this.getView().getModel().refresh();
                        this.onClose();
                    }.bind(this),
                    error: function (oError) {
                        sap.m.MessageBox.error(JSON.stringify(oError));
                        this.onClose();
                    }.bind(this)
                });
            }
        }
    });
});
