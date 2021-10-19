sap.ui.define(["sap/ui/core/mvc/Controller"], function (Controller) {
    "use strict";

    return Controller.extend("com.agel.mmts.selfroleassignment.view.blocks.UserDetails.basicDetails.BasicDetailsController", {

        onRoleDialogPress: function (oEvent) {
            this.oParentBlock.fireOnRoleDialogPress(oEvent);
        },
        // onCancel: function (oEvent) {
        //     this.oParentBlock.fireOnCancel(oEvent);
        // },

        // onSave: function (oEvent) {
        //     this.oParentBlock.fireOnSave(oEvent);
        // }
    });
});
