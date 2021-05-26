sap.ui.define([
    "./BaseController",
    'sap/f/library'
],
	/**
	 * @param {typeof sap.ui.core.mvc.Controller} Controller
	 */
    function (BaseController, fioriLibrary) {
        "use strict";

        return BaseController.extend("com.agel.mmts.mdmboqitems.controller.LandingPage", {

            // Initialisation
            onInit: function () {
                var oModel = this.getOwnerComponent().getModel("layoutModel");
                oModel.setProperty("/layout", "OneColumn");

                //Router Object
                this.oRouter = this.getRouter();
                this.oRouter.getRoute("LandingPage").attachPatternMatched(this._onObjectMatched, this);
            },

            //ObjectMatch
            _onObjectMatched: function (oEvent) {
                var sLayout = oEvent.getParameter("arguments").layout;

                this.getView().getModel("layoutModel").setProperty("/layout", sLayout);
                //   this._bindView("/MasterUOMSet" + this.sParentID);
            },

            //triggers on press of a PO cheveron item from the list
            onParentLineItemPress: function (oEvent) {
                // The source is the list item that got pressed
                this._showObject(oEvent.getSource());
            },

            // Show Object
            _showObject: function (oItem) {
                var that = this;
                var sObjectPath = oItem.getBindingContext().sPath;

                this.oRouter.navTo("detail", {
                    parentMaterial: sObjectPath.slice("/MasterUOMSet".length),
                    layout: "TwoColumnsMidExpanded"
                },
                    false
                );
            },

            onCreatePress: function (oEvent) {
                this.oRouter.navTo("detail", {
                    parentMaterial: "new",
                    layout: "TwoColumnsMidExpanded"
                },
                    false
                );
            }

        });
    });
