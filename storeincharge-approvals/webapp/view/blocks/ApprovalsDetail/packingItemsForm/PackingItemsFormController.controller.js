
sap.ui.define(["sap/ui/core/mvc/Controller"], function (Controller) {
    "use strict";

    return Controller.extend("com.agel.mmts.storeinchargeapprovals.view.blocks.ApprovalsDetail.packingItemsForm.PackingItemsForm", {
  
        onpressPackingListDetails: function(oEvent){
            // this.oParentBlock.fireOnpressPackingListDetails(oEvent);
            this._showObject(oEvent.getSource());
        },
        _showObject: function (oItem) {
            var that = this;
            var oRouter = this.getOwnerComponent().getRouter();
            var sObjectPath = oItem.getBindingContext().getPath();
            oRouter.navTo("RouteDetailsPage", {
            RequestId: sObjectPath.slice("/PackingListSet".length) // /ParentLineItemSet(123)->(123)
        });
    }
      

    });
});