sap.ui.define([
    "com/agel/mmts/vendorPersona/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment"
], function (BaseController, JSONModel, Fragment) {
    "use strict";

    return BaseController.extend("com.agel.mmts.vendorPersona.controller.PackingListDetails", {

        onInit: function () {
            //view model instatiation
            var oViewModel = new JSONModel({
                busy: true,
                delay: 0
            });
            this.setModel(oViewModel, "objectViewModel");

            //Router Object
            this.oRouter = this.getRouter();
            this.oRouter.getRoute("RoutePackingDeatilsPage").attachPatternMatched(this._onObjectMatched, this);
        },

        _onObjectMatched: function (oEvent) {
            var sObjectId = oEvent.getParameter("arguments").packingListID;
            this._bindView("/PackingLists" + sObjectId);
        },

        _bindView: function (sObjectPath) {
            console.log({sObjectPath});
            var objectViewModel = this.getViewModel("objectViewModel");
            var that = this;

            this.getView().bindElement({
                path: sObjectPath,
                parameters: {
                    "$expand": {
                        "insepected_parent_line_items": {
                            "$expand": {
                                "inspected_child_line_items": {}
                            }
                        }
                    }
                },
                events: {
                    dataRequested: function () {
                        objectViewModel.setProperty("/busy", true);
                    },
                    dataReceived: function () {
                        objectViewModel.setProperty("/busy", false);
                    }
                }
            });
        }


    });

}
);