sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/Fragment",
    "sap/ui/model/Sorter",
    "sap/ui/Device",
    "sap/ui/core/routing/History",
    'sap/m/ColumnListItem',
    'sap/m/Input',
    'sap/base/util/deepExtend',
    'sap/ui/export/Spreadsheet',
    'sap/m/MessageToast',
    "sap/m/MessageBox",
    "sap/m/ObjectIdentifier",
    "sap/m/Text",
    "sap/m/Button"
], function (BaseController, JSONModel, Filter, FilterOperator, Fragment, Sorter, Device, History, ColumnListItem, Input, deepExtend, Spreadsheet, MessageToast, MessageBox, ObjectIdentifier, Text, Button) {
    "use strict";

    return BaseController.extend("com.agel.mmts.selfroleassignment.controller.UserDetails", {

        onInit: function () {

            //get logged in User
            try {
                this.UserEmail = sap.ushell.Container.getService("UserInfo").getEmail();
            }
            catch (e) {
                // this.UserEmail = "atul.jain@extentia.com";
                this.UserEmail = "aakash.d@extentia.com";
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
                Role: null
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
            var oEmailIDFilter = new Filter("Email", FilterOperator.EQ, this.UserEmail);
            this.getView().getModel().read("/UserSet", {
                filters: [oEmailIDFilter],
                urlParameters: {
                    $expand: "UserRoles/Role"
                },
                success: function (oResponse) {
                    if (oResponse.results) {
                        var oFormattedData = this.fnFormatData(oResponse.results[0]);
                        var oUserDetailModel = new JSONModel(oFormattedData);
                        this.getView().setModel(oUserDetailModel, "UserDetailModel");
                    }
                }.bind(this),
                error: function (oError) {
                    sap.m.MessageBox.error(JSON.stringify(oError));
                }
            });
        },

        fnFormatData: function (oData) {
            oData.UserRoles = oData.UserRoles.results;
            return oData;
        },

        onRoleDialogPress: function (oEvent) {
            var sDialogTitle = "Name: " + this.getView().getModel("UserDetailModel").getProperty("/FirstName") + " " + this.getView().getModel("UserDetailModel").getProperty("/LastName"),
                oDetails = {};

            oDetails.controller = this;
            oDetails.view = this.getView();
            oDetails.title = sDialogTitle;

            if (!this.pDialog) {
                this.pDialog = Fragment.load({
                    id: oDetails.view.getId(),
                    name: "com.agel.mmts.selfroleassignment.view.fragments.AssignRole.AssignRoleDialog",
                    controller: oDetails.controller
                }).then(function (oDialog) {
                    oDetails.view.addDependent(oDialog);
                    oDialog.setTitle(oDetails.title);
                    return oDialog;
                });
            }
            this.pDialog.then(function (oDialog) {
                oDetails.view.addDependent(oDialog);
                oDialog.setTitle(oDetails.title);
                oDialog.addStyleClass("sapUiSizeCompact");
                oDialog.open();
            });
        },

        onClose: function (oEvent) {
            this.pDialog.then(function (oDialog) {
                oDialog.close();
            });
        },

        onSave: function (oEvent) {
            var userID = Number(this.getView().getModel("UserDetailModel").getProperty("/ID")),
                sUserName = this.getView().getModel("UserDetailModel").getProperty("/FirstName"),
                sRoleId = this.getView().byId("roleEdit").getSelectedKeys();

            sRoleId = sRoleId.map(function (item) {
                return {
                    RoleId: parseInt(item)
                };
            });

            var oUserRoleRequestObj = {
                "UserId": userID,
                "UserName": sUserName,
                "UpdateRequestFlag": false,
                "Roles": sRoleId
            };

            this.getComponentModel().create("/RoleAssignApprovalRequestEdmSet", oUserRoleRequestObj, {
                success: function () {
                    sap.m.MessageBox.success("Request for new user role submitted successfully.");
                    this.getComponentModel().refresh();
                    this.onClose();
                }.bind(this),
                error: function (oError) {
                    sap.m.MessageBox.error(JSON.stringify(oError));
                    this.onClose();
                }.bind(this)
            });
        }
    });
});
