sap.ui.define([
    "./BaseController",
    "sap/ui/core/Fragment",
    "sap/ui/Device",
    "sap/ui/model/json/JSONModel",
    'sap/m/Token',
    'sap/m/ColumnListItem',
    'sap/m/Label',
    'sap/m/MessageBox',
    '../utils/formatter'
	], function (BaseController, Fragment, Device, JSONModel, Token, ColumnListItem, Label, MessageBox, formatter) {
		"use strict";

		return BaseController.extend("com.agel.mmts.vendorpackinglistcreate.controller.PackingListDetails", {
            formatter: formatter,
			onInit : function () {
               jQuery.sap.addUrlWhitelist("blob");
                this.mainModel = this.getOwnerComponent().getModel();
                //Router Object
                this.oRouter = this.getOwnerComponent().getRouter();
                this.oRouter.getRoute("RoutePackingListDetails").attachPatternMatched(this._onObjectMatched, this);

                //view model instatiation
                var oViewModel = new JSONModel({
                    busy: false,
                    delay: 0,
                    isPackagingTableVisible: false,
                    isPackingListInEditMode: false,
                    isOuterPackagingRequired: true

                });
                this.setModel(oViewModel, "objectViewModel");
            },
            
            _onObjectMatched: function (oEvent) {
                var objectViewModel = this.getViewModel("objectViewModel");
                var that = this;
                this.getView().bindElement({
                    path: "/PackingListSet(5)",
                    events: {
                        dataRequested: function () {
                            objectViewModel.setProperty("/busy", true);
                        },
                        dataReceived: function () {
                            var bIsProcessTwoCompletes = this.getBoundContext().getObject().IsProcessTwoCompletes;
                            var bIsOuterPackagingRequired = this.getBoundContext().getObject().IsOuterPackagingRequired;
                            if (!bIsOuterPackagingRequired.length)
                                objectViewModel.setProperty("/isOuterPackagingRequired", true);
                            if (bIsProcessTwoCompletes)
                                objectViewModel.setProperty("/isPackingListInEditMode", false);
                            else
                                objectViewModel.setProperty("/isPackingListInEditMode", true);
                            objectViewModel.setProperty("/busy", false);
                        }
                    }
                });
                // this._getPackingListOuterPackagingData();
                // this._getPackingListInnerPackagingData();
                // this._createAdditionalDetailsModel();
            },

            onViewQRCode: function() {
                this.selectedQRCodeObject = oEvent.getSource().getBindingContext("QRCodeModel").getObject();
                var oButton = oEvent.getSource(),
                    oView = this.getView();

                if (!this._pDialog) {
                    this._pDialog = Fragment.load({
                        id: oView.getId(),
                        name: "com.agel.mmts.vendorpackinglistcreate.view.fragments.packingListDetails.ValueHelpDialog",
                        controller: this
                    }).then(function (oDialog) {
                        oView.addDependent(oDialog);
                        if (Device.system.desktop) {
                            oDialog.addStyleClass("sapUiSizeCompact");
                        }
                        return oDialog;
                    });
                }

                this._pDialog.then(function (oDialog) {
                    //this._configDialog(oButton, oDialog);
                    oDialog.open();
                }.bind(this));
            },
		});

	}
);