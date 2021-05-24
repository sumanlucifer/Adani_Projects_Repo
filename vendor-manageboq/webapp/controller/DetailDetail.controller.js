sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel"
],
	/**
	 * @param {typeof sap.ui.core.mvc.Controller} Controller
	 */
    function (BaseController, JSONModel) {
        "use strict";

        return BaseController.extend("com.agel.mmts.vendormanageboq.controller.DetailDetail", {
            onInit: function () {

                //view model instatiation
                var oViewModel = new JSONModel({
                    busy: false,
                    delay: 0,
                    noParentChildRelationFlag: false,
                    isCreatingPCList: false,
                    isPCListSelected: false,
                    sViewBOQButtonName: "View BOQ List"
                });
                this.setModel(oViewModel, "objectViewModel");

                //Router Object
                this.oRouter = this.getRouter();
                this.oRouter.getRoute("detailDetail").attachPatternMatched(this._onObjectMatched, this);


            },

            _onObjectMatched: function (oEvent) {
                this.sParentID = oEvent.getParameter("arguments").parentMaterial;
                var sLayout = oEvent.getParameter("arguments").layout;

                this.getView().getModel().setProperty("/busy", false);

                this.getView().getModel("layoutModel").setProperty("/layout", sLayout);
                this._bindView("/ParentLineItemSet" + this.sParentID);
            },

            _bindView: function (sObjectPath) {
                var objectViewModel = this.getViewModel("objectViewModel");
                var that = this;

                this.getView().bindElement({
                    path: sObjectPath,
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
    });
