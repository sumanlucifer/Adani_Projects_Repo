sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    // "sap/ui/core/Fragment",
    "sap/ui/model/Sorter",
    // 'sap/ui/core/ValueState'
],
	/**
	 * @param {typeof sap.ui.core.mvc.Controller} Controller
	 */
    function (BaseController, JSONModel, Filter, FilterOperator, Sorter) {
        "use strict";

        return BaseController.extend("com.agel.mmts.userroleassignment.controller.UserList", {
            onInit: function () {
                //Router Object
                this.oRouter = this.getRouter();
                this.oRouter.getRoute("RouteUserList").attachPatternMatched(this._onObjectMatched, this);

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

            // on Go Search 
            onSearch: function (oEvent) {
                var frstName = this.byId("idfrstName").getValue();
                var lstName = this.byId("idlstName").getValue();
                var email = this.byId("idEmail").getValue();
                var DateRange = this.byId("dateRangeSelectionId");
                var DateRangeValue = this.byId("dateRangeSelectionId").getValue();

                var orFilters = [];
                var andFilters = [];

                var FreeTextSearch = this.byId("filterbar").getBasicSearchValue();
                if (FreeTextSearch) {
                    orFilters.push(new Filter("FirstName", FilterOperator.Contains, FreeTextSearch));
                    orFilters.push(new Filter("LastName", FilterOperator.EQ, FreeTextSearch));
                    orFilters.push(new Filter("Email", FilterOperator.EQ, FreeTextSearch));

                    andFilters.push(new Filter(orFilters, false));
                }

                // First Name
                if (frstName != "") {
                    andFilters.push(new Filter("FirstName", FilterOperator.EQ, frstName));
                }

                // Last Name
                if (lstName != "") {
                    andFilters.push(new Filter("LastName", FilterOperator.EQ, lstName));
                }

                // Email
                if (email != "") {
                    andFilters.push(new Filter("Email", FilterOperator.EQ, email));
                }

                // Created At
                if (DateRangeValue != "") {
                    var From = new Date(DateRange.getFrom());
                    var To = new Date(DateRange.getTo());
                    andFilters.push(new Filter("CreatedAt", FilterOperator.BT, From.toISOString(), To.toISOString()));
                }


                var idBOQRequestTableBinding = this.getView().byId("idUserRoleTable").getTable().getBinding("items");
                if (andFilters.length == 0) {
                    andFilters.push(new Filter("FirstName", FilterOperator.NE, ""));
                    idBOQRequestTableBinding.filter(new Filter(andFilters, true));
                }


                if (andFilters.length > 0) {
                    idBOQRequestTableBinding.filter(new Filter(andFilters, true));
                }
                // oTableBinding.filter(mFilters);
            },

            onResetFilters: function (oEvent) {
                this.oFilterBar._oBasicSearchField.setValue("");
                this.byId("idfrstName").setValue("");
                this.byId("idlstName").setValue("");
                this.byId("idEmail").setValue("");
                this.byId("dateRangeSelectionId").setValue("");

                var oTable = this.getView().byId("idUserRoleTable").getTable();
                var oBinding = oTable.getBinding("items");
                oBinding.filter([]);
            },

            onFilterChange: function (oEvent) {
                //   if (oEvent.getSource().getValue().length){
                this.oFilterBar.fireFilterChange(oEvent);
                //  }
            },
          
            onBeforeRebindBOQTable: function (oEvent) {
                var mBindingParams = oEvent.getParameter("bindingParams");
                mBindingParams.sorter.push(new sap.ui.model.Sorter("CreatedAt", true));
            }

        });
    });
