sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], function (BaseController, JSONModel, Filter, FilterOperator) {
    "use strict";

    return BaseController.extend("com.agel.mmts.selfroleassignment.controller.UserDetails", {

        onInit: function () {

            //get logged in User
            try {
                this.UserEmail = sap.ushell.Container.getService("UserInfo").getEmail();
            }
            catch (e) {
                this.UserEmail = "test.user@extentia.com";
            }

            this.getView().addEventDelegate({
                onAfterShow: this.onBeforeShow,
            }, this);

            //view model instatiation
            var oViewModel = new JSONModel({
                busy: false,
                delay: 0,
                boqSelection: null,
                ID: null,
                Role: null,
                UserEmail: this.UserEmail
            });
            this.setModel(oViewModel, "objectViewModel");

            // Keeps reference to any of the created sap.m.ViewSettingsDialog-s in this sample
            this._mViewSettingsDialogs = {};

            //Router Object
            this.oRouter = this.getRouter();
            this.oRouter.getRoute("RouteLandingPage").attachPatternMatched(this._onObjectMatched, this);
        },

        _onObjectMatched: function (oEvent) {
            this.fnGetUserDetails();
        },

        fnGetUserDetails: function () {
            this.getViewModel("objectViewModel").setProperty(
                "/busy",
                true
            );
            var oEmailIDFilter = new Filter("Email", FilterOperator.EQ, this.UserEmail);
            this.getView().getModel().read("/UserSet", {
                filters: [oEmailIDFilter],
                urlParameters: {
                    $expand: "UserRoles/Role"
                },
                success: function (oResponse) {
                    this.getViewModel("objectViewModel").setProperty(
                        "/busy",
                        false
                    );
                    if (oResponse.results) {
                        var oFormattedData = this.fnFormatData(oResponse.results[0]);
                        var oUserDetailModel = new JSONModel(oFormattedData);
                        this.getView().setModel(oUserDetailModel, "UserDetailModel");
                    }
                }.bind(this),
                error: function (oError) {
                    this.getViewModel("objectViewModel").setProperty(
                        "/busy",
                        false
                    );
                    // sap.m.MessageBox.error(JSON.stringify(oError));
                }.bind(this),
            });
        },

        fnFormatData: function (oData) {
            oData.UserRoles = oData.UserRoles.results;
            return oData;
        }
    });
});
