sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/Fragment",
    "sap/ui/model/Sorter",
    "sap/ui/Device",
    'sap/ui/core/ValueState'
], function (BaseController, JSONModel, Filter, FilterOperator, Fragment, Sorter, Device, ValueState) {
    "use strict";

    return BaseController.extend("com.agel.mmts.storeinchargereturnmaterial.controller.LandingPage", {
        onReturnMaterialSelect: function(oEvent) {
            var ReturnId = oEvent.getSource().getBindingContextPath();
            var SOId = this.getViewModel().getData(ReturnId+'/SONumberId').ID;
            ReturnId = ReturnId.match(/\((.*?)\)/)[1];
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("RouteDetailsPage",{
                ReturnId: ReturnId,
                SOId: SOId
            })
        }
    });
});