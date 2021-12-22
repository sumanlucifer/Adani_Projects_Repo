sap.ui.define([
    "./BaseController",
    // 'sap/f/library',
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
],
	/**
	 * @param {typeof sap.ui.core.mvc.Controller} Controller
	 */
    function (BaseController, Filter, FilterOperator) {
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
                this.recievedPONumber="";
                var startupParams = this.getOwnerComponent().getComponentData().startupParameters;
                // get Startup params from Owner Component
                if ((startupParams.poNumber && startupParams.poNumber[0])) {
                    this.recievedPONumber = startupParams.poNumber;
                }
                // this.recievedPONumber = "4500011223";
                var list = this.byId("idParentLineItemList");
                if (list) {
                    var oItems = new sap.m.ObjectListItem({
                        title: "{Name}",
                        attributes: [new sap.m.ObjectAttribute({
                            text: "Line No: {LineNumber}"
                        }), new sap.m.ObjectAttribute({
                            text: "Description: {Description}"
                        })],
                        firstStatus: [new sap.m.ObjectStatus({
                            text: "Material Code: {MaterialCode}"
                        })],
                        type: "Navigation"
                    }).attachPress(this.onParentLineItemPress, this);
                    var oFilters = [new sap.ui.model.Filter("PONumber", sap.ui.model.FilterOperator.EQ, this.recievedPONumber)];
                    list.bindAggregation("items", {
                        path: '/ParentLineItemSet',
                        template: oItems,
                        filters: oFilters
                    });
                }
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
