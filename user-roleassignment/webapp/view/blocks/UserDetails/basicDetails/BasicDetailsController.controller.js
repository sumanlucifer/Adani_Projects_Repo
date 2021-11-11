sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox"
], function (Controller, MessageBox) {
    "use strict";

    return Controller.extend("com.agel.mmts.userroleassignment.view.blocks.UserDetails.basicDetails.BasicDetailsController", {

        onRoleDialogPress: function (oEvent) {
            this.oParentBlock.fireOnRoleDialogPress(oEvent);
        },

        onAddRemoveDeptHeadPress: function (oEvent) {
            var oUserRoleObj = this.fnGetPayloadObject(oEvent);

            this.getView().getModel().create("/UpdateUserRoleMappingEdmSet", oUserRoleObj, {
                success: function (oResponse) {
                    if (oResponse.Success)
                        MessageBox.success(oResponse.Message);
                    else
                        MessageBox.error(oResponse.Message);
                    this.getView().getModel().refresh();
                }.bind(this),
                error: function (oError) {
                    MessageBox.error(JSON.stringify(oError));
                }
            });
        },

        fnGetPayloadObject: function (oEvent) {
            var sUserRoleID = oEvent.getSource().getParent().getBindingContext().getObject().ID,
                sAction = oEvent.getSource().getType(),
                aUserRoles = this.getView().byId("idUserRolesTBL").getItems(),
                aHODRoles = aUserRoles.filter(function (oUserRole) {
                    return oUserRole.getBindingContext().getObject().IsHeadOfDepartment === true;
                }),
                oPayloadObj = {
                    "UserRoleMappingId": sUserRoleID,
                    "IsHeadOfDepartment": false,
                    "AddHeadOfDepartment": false,
                    "RemoveHeadOfDepartment": false
                };

            // If User adding him/herself as HOD
            if (sAction === "Accept") {
                // If Not an HOD Before i.e First Time being HOD
                if (aHODRoles.length <= 0)
                    oPayloadObj.AddHeadOfDepartment = true;

                // If already HOD and Being HOD for new Role
                else
                    oPayloadObj.IsHeadOfDepartment = true;
            }
            // If User removing him/herself as HOD
            else {
                if (aHODRoles.length === 1)
                    oPayloadObj.RemoveHeadOfDepartment = true;
            }

            return oPayloadObj;
        }
    });
});
