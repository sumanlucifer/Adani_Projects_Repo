sap.ui.define([
    "./BaseController",
    'sap/f/library',
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
],
	/**
	 * @param {typeof sap.ui.core.mvc.Controller} Controller
	 */
    function (BaseController, fioriLibrary, Filter, FilterOperator) {
        "use strict";

        return BaseController.extend("com.agel.mmts.vendormanageboq.controller.LandingPage", {
            onInit: function () {

                var oModel = this.getOwnerComponent().getModel("layoutModel");
                oModel.setProperty("/layout", "OneColumn");

                //Router Object
                this.oRouter = this.getRouter();
                this.oRouter.getRoute("LandingPage").attachPatternMatched(this._onObjectMatched, this);
            },

            _onObjectMatched: function (oEvent) {
                var sLayout = oEvent.getParameter("arguments").layout;

                this.getView().getModel("layoutModel").setProperty("/layout", sLayout);
                //this._bindView("/ParentLineItemSet" + this.sParentID);
                var poNumber;
                /* var startupParams = this.getOwnerComponent().getComponentData().startupParameters; // get Startup params from Owner Component
                if ((startupParams.poNumber && startupParams.poNumber[0])) {
                    this.recievedPONumber = startupParams.poNumber;
                } */
            },

            onUpdateListFinished: function (oEvent) {
                var oBinding = oEvent.getSource().getBinding("items");
                var aFilter = [];
                if (this.recievedPONumber) {
                    aFilter.push(new Filter("PONumber", FilterOperator.EQ, this.recievedPONumber));
                }
                //oBinding.filter(aFilter);
            },

            //triggers on press of a PO cheveron item from the list
            onParentLineItemPress: function (oEvent) {
                // The source is the list item that got pressed
                this._showObject(oEvent.getSource());
            },

            _showObject: function (oItem) {
                var that = this;
                var sObjectPath = oItem.getBindingContext().sPath;

                this.oRouter.navTo("detail", {
                    parentMaterial: sObjectPath.slice("/ParentLineItemSet".length),
                    layout: "TwoColumnsMidExpanded"
                },
                    false
                );
            }

        });
    });
