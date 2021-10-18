sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/Fragment",
    "sap/ui/model/Sorter",
    'sap/ui/core/ValueState'
],
	/**
	 * @param {typeof sap.ui.core.mvc.Controller} Controller
	 */
    function (BaseController, JSONModel, Filter, FilterOperator, Fragment, Sorter, ValueState) {
        "use strict";

        return BaseController.extend("com.agel.mmts.hodroleapproval.controller.LandingPage", {
            onInit: function () {

                //get logged in User
                try {
                    this.ApproverEmailID = sap.ushell.Container.getService("UserInfo").getEmail();
                }
                catch (e) {
                    this.ApproverEmailID = "aakash.d@extentia.com";
                }

                //view model instatiation
                var oViewModel = new JSONModel({
                    busy: false,
                    delay: 0
                });
                this.setModel(oViewModel, "objectViewModel");

                // keeps the search state
                this._aTableSearchState = [];
                // Keeps reference to any of the created dialogs
                this._mViewSettingsDialogs = {};

                //adding searchfield association to filterbar and initialize the filter bar -> added in base controller
                this.initializeFilterBar();
            },

            // User Role Detail Press
            onUserRoleDetlPress: function (oEvent) {
                // The source is the list item that got pressed
                this._showObject(oEvent.getSource());
            },

            // Show Object Method
            _showObject: function (oItem) {
                var that = this;
                var sObjectPath = oItem.getBindingContext().sPath;
                that.getRouter().navTo("RouteUserRoleDetailPage", {
                    BOQRequestId: sObjectPath.slice("/UserSet".length)
                });
            },

            onBeforeRebindApprovalRequestsTable: function (oEvent) {
                var mBindingParams = oEvent.getParameter("bindingParams");
                mBindingParams.sorter.push(new sap.ui.model.Sorter("CreatedAt", true));
                // mBindingParams.filters.push(new sap.ui.model.Filter("Email", sap.ui.model.FilterOperator.EQ, this.ApproverEmailID));
            },

            onApproveRequestPress: function (oEvent) {
                this.fnSaveApproveRejectRequest("APPROVED", oEvent);
            },

            onRejectRequestPress: function (oEvent) {
                this.fnSaveApproveRejectRequest("REJECTED", oEvent);
            },

            fnSaveApproveRejectRequest: function (sStatus, oEvent) {
                var oSelectedUserObj = oEvent.getSource().getParent().getBindingContext().getObject(),
                    oApproveRejectObj = {
                        // "UserName": sap.ushell.Container.getService("UserInfo").getFirstName(),
                        "UserName": "Atul",
                        "UserId": Number(oSelectedUserObj.UserId),
                        "UpdateRequestFlag": true,
                        "RoleAssignApprovalRequestId": Number(oSelectedUserObj.ID),
                        "Status": sStatus,
                        "Roles": [
                            {
                                "RoleName": oSelectedUserObj.Role
                            }
                        ]
                    };

                this.getView().getModel().create("/RoleAssignApprovalRequestEdmSet", oApproveRejectObj, {
                    success: function (oResponse) {
                        sap.m.MessageBox.success("Request " + sStatus.toLowerCase() + " successfully.");
                        this.getOwnerComponent().getModel().refresh();
                    }.bind(this),
                    error: function (oError) {
                        sap.m.MessageBox.error(JSON.stringify(oError));
                    }
                });


            },

            // on Go Search 
            onSearch: function (oEvent) {
                var userid = this.byId("idUserId").getValue();
                var role = this.byId("idRole").getValue();
                var email = this.byId("idEmail").getValue();
                var requestnumber = this.byId("idRequestNumber").getValue();
                var DateRange = this.byId("dateRangeSelectionId");
                var DateRangeValue = this.byId("dateRangeSelectionId").getValue();

                var orFilters = [];
                var andFilters = [];

                var FreeTextSearch = this.byId("filterbar").getBasicSearchValue();
                if (FreeTextSearch) {
                    orFilters.push(new Filter("UserId", FilterOperator.EQ, Number(FreeTextSearch)));
                    orFilters.push(new Filter("Role", FilterOperator.Contains, FreeTextSearch));
                    orFilters.push(new Filter("Email", FilterOperator.Contains, FreeTextSearch));
                    orFilters.push(new Filter("RequestNumber", FilterOperator.Contains, FreeTextSearch));

                    andFilters.push(new Filter(orFilters, false));
                }

                // First Name
                if (userid != "") {
                    andFilters.push(new Filter("UserId", FilterOperator.EQ, userid));
                }

                // Last Name
                if (role != "") {
                    andFilters.push(new Filter("Role", FilterOperator.EQ, role));
                }

                // Email
                if (email != "") {
                    andFilters.push(new Filter("Email", FilterOperator.EQ, email));
                }

                //RequestNumber
                if (requestnumber != "") {
                    andFilters.push(new Filter("RequestNumber", FilterOperator.EQ, requestnumber));
                }

                // Created At
                if (DateRangeValue != "") {
                    var From = new Date(DateRange.getFrom());
                    var To = new Date(DateRange.getTo());
                    andFilters.push(new Filter("CreatedAt", FilterOperator.BT, From.toISOString(), To.toISOString()));
                }


                var idRequestTableBinding = this.getView().byId("idApproveRejectRolesTBL").getTable().getBinding("items");
                if (andFilters.length == 0) {
                    andFilters.push(new Filter("RequestNumber", FilterOperator.NE, ""));
                    idBOQRequestTableBinding.filter(new Filter(andFilters, true));
                }


                if (andFilters.length > 0) {
                    idRequestTableBinding.filter(new Filter(andFilters, true));
                }
                // oTableBinding.filter(mFilters);
            },

            onResetFilters: function (oEvent) {
                this.oFilterBar._oBasicSearchField.setValue("");
                this.byId("idUserId").setValue("");
                this.byId("idRole").setValue("");
                this.byId("idEmail").setValue("");
                this.byId("idRequestNumber").setValue("");
                this.byId("dateRangeSelectionId").setValue("");

                var oTable = this.getView().byId("idApproveRejectRolesTBL").getTable();
                var oBinding = oTable.getBinding("items");
                oBinding.filter([]);
            },

            onFilterChange: function (oEvent) {
                //   if (oEvent.getSource().getValue().length){
                this.oFilterBar.fireFilterChange(oEvent);
                //  }
            }
        });
    });
