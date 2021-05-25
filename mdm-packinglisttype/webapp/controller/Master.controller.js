sap.ui.define([
    "./BaseController",
    'sap/f/library'
],
	/**
	 * @param {typeof sap.ui.core.mvc.Controller} Controller
	 */
    function (BaseController, fioriLibrary) {
        "use strict";

        return BaseController.extend("com.agel.mmts.mdmpackinglisttype.controller.Master", {
            onInit: function () {

                var oModel = this.getOwnerComponent().getModel("layoutModel");
                oModel.setProperty("/layout", "OneColumn");

                //Router Object
                this.oRouter = this.getRouter();
                this.oRouter.getRoute("RouteMaster").attachPatternMatched(this._onObjectMatched, this);
            },

            _onObjectMatched: function (oEvent) {
                var sLayout = oEvent.getParameter("arguments").layout;
                debugger;
                //this.getView().getModel("layoutModel").setProperty("/layout", sLayout);
                //this._bindView("/MasterPackagingTypeSet" + this.sParentID);
            },

            //triggers on press of a PO cheveron item from the list
            onPackingListTypePress: function (oEvent) {
                // The source is the list item that got pressed
                this._showObject(oEvent.getSource());
            },

            _showObject: function (oItem) {
                var that = this;
                var sObjectPath = oItem.getBindingContext().sPath;

                this.oRouter.navTo("detail", {
                    packingListType: sObjectPath.slice("/MasterPackagingTypeSet".length),
                    layout: "TwoColumnsMidExpanded"
                },
                    false
                );
            }

        });
    });
