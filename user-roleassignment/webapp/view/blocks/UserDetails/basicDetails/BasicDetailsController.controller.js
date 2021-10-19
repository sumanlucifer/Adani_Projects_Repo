sap.ui.define(["sap/ui/core/mvc/Controller"], function (Controller) {
    "use strict";

    return Controller.extend("com.agel.mmts.userroleassignment.view.blocks.UserDetails.basicDetails.BasicDetailsController", {

        onRoleDialogPress: function (oEvent) {
            this.oParentBlock.fireOnRoleDialogPress(oEvent);
        },

        // onCancel: function (oEvent) {
        //     this.oParentBlock.fireOnCancel(oEvent);
        // },

        // onSave: function (oEvent) {
        //     this.oParentBlock.fireOnSave(oEvent);
        // },

        onCreateDeptHeadPress: function (oEvent) {
            var sUserRoleID = oEvent.getSource().getParent().getBindingContext().getObject().ID,
                oUserRoleObj = {
                    "UserRoleMappingId": sUserRoleID,
                    "IsHeadOfDepartment": true
                };

            this.getView().getModel().create("/UpdateUserRoleMappingEdmSet", oUserRoleObj, {
                success: function (oResponse) {
                    sap.m.MessageBox.success(oResponse.Message);
                    this.getView().getModel().refresh();
                }.bind(this),
                error: function (oError) {
                    sap.m.MessageBox.error(JSON.stringify(oError));
                }
            });
        }
    });
});
