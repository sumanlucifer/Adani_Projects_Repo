sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment",
    "sap/ui/Device",
    "../utils/formatter"
],
	/**
	 * @param {typeof sap.ui.core.mvc.Controller} Controller
	 */
    function (BaseController, JSONModel, Fragment,Device, formatter) {
        "use strict";

        return BaseController.extend("com.agel.mmts.vendormanageboq.controller.DetailDetail", {
            formatter: formatter,
            
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
            },

            onBOQGroupItemPress: function (oEvent) {
                var sParentItemPath = oEvent.getSource().getBindingContext().getPath();
                var sDialogTitle = "BOQ Items of " + oEvent.getSource().getBindingContext().getObject().Name;
                var oDetails = {};
                oDetails.controller = this;
                oDetails.view = this.getView();
                oDetails.sParentItemPath = sParentItemPath;
                oDetails.title = sDialogTitle;
                if (!this.pDialog) {
                    this.pDialog = Fragment.load({
                        id: oDetails.view.getId(),
                        name: "com.agel.mmts.vendormanageboq.view.fragments.detailPage.ViewBOQItemsDialog",
                        controller: oDetails.controller
                    }).then(function (oDialog) {
                        // connect dialog to the root view of this component (models, lifecycle)
                        oDetails.view.addDependent(oDialog);
                        oDialog.bindElement({
                            path: oDetails.sParentItemPath
                        });
                        oDialog.setTitle(oDetails.title)
                        if (Device.system.desktop) {
                            oDialog.addStyleClass("sapUiSizeCompact");
                        }
                        return oDialog;
                    });
                }
                this.pDialog.then(function (oDialog) {
                    oDetails.view.addDependent(oDialog);
                    oDialog.bindElement({
                        path: oDetails.sParentItemPath
                    });
                    oDialog.open();
                });
            },

            onViewChildDialogClose: function (oEvent) {
                this.pDialog.then(function (oDialog) {
                    oDialog.close();
                });
            }

        });
    });
