sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/Fragment",
    "sap/ui/model/Sorter",
    "sap/ui/Device"
], function (BaseController, JSONModel, Filter, FilterOperator, Fragment, Sorter, Device) {
    "use strict";

    return BaseController.extend("com.agel.mmts.vendorPersona.controller.DetailPage", {

        onInit: function () {
            //view model instatiation
            var oViewModel = new JSONModel({
                busy: true,
                delay: 0
            });
            this.setModel(oViewModel, "objectViewModel");

            //Router Object
            this.oRouter = this.getRouter();
            this.oRouter.getRoute("RouteDetailPage").attachPatternMatched(this._onObjectMatched, this);

            this._initializeCreationModel();

            //adding searchfield association to filterbar                                    
            this._addSearchFieldAssociationToFB();
        },

        _addSearchFieldAssociationToFB: function () {
            let oFilterBar = this.getView().byId("filterbar");
            let oSearchField = oFilterBar.getBasicSearch();
            var oBasicSearch;
            if (!oSearchField) {
                // @ts-ignore   
                oBasicSearch = new sap.m.SearchField({ id: "idSearch", showSearchButton: false });
            } else {
                oSearchField = null;
            }
            oFilterBar.setBasicSearch(oBasicSearch);
            oBasicSearch.attachBrowserEvent("keyup", function (e) {
                if (e.which === 13) {
                    this.onSearch();
                }
            }.bind(this));
        },

        _onObjectMatched: function (oEvent) {
            var sObjectId = oEvent.getParameter("arguments").vendorId;
            this._bindView("/Vendors" + sObjectId);
        },

        _initializeCreationModel: function () {
            var oCreationModel = new JSONModel({
                "invoice_number": "",
                "po_number": "",
                "po_release_date": ""
            });
            this.getView().setModel(oCreationModel, "creationModel")
        },

        _bindView: function (sObjectPath) {
            var objectViewModel = this.getViewModel("objectViewModel");
             var userInfo = sap.ushell.Container.getService("UserInfo");
             var userEmail = userInfo.getEmail();

            userEmail = userEmail || "symantic.engineering@testemail.com"
            this.getView().byId("idPurchaseOrdersTable").bindElement({
                path: "/Vendors",
                parameters: {
                    "$filter":"email eq "+userEmail,
                    "$expand": "purchase_orders"
                }
            });

            
        },

        onPurchaseOrderTableUpdateFinished: function (oEvent) {
            //Setting the header context for a property binding to $count
            var oView = this.getView(),
                oTableBinding = oView.byId("idPurchaseOrdersTable").getBinding("items");

            if (oTableBinding.getHeaderContext())
                oView.byId("tableHeader").setBindingContext(oTableBinding.getHeaderContext());
        },

        //triggers on press of a vendor item from the list
        onPurchaseOrderPress: function (oEvent) {
            // The source is the list item that got pressed
            this._showObject(oEvent.getSource());
        },

        _showObject: function (oItem) {
            var that = this;
            oItem.getBindingContext().requestCanonicalPath().then(function (sObjectPath) {
                that.getRouter().navTo("RoutePODetailPage", {
                    POId: sObjectPath.slice("/PurchaseOrders".length) // /PurchaseOrders(123)->(123)
                });
            });
        },

        //when the breadcrum pressed
        handleToAllVendorsBreadcrumPress: function (oEvent) {
            this.getRouter().navTo("RouteLandingPage");
        },

        // on Go Search 
        onSearch: function (oEvent) {
            var poNumber = this.byId("idNameInput").getValue();
            var releaseDate = this.byId("DP1").getValue();
            var aFilters = [];
            if (poNumber != "") {
                aFilters.push(new sap.ui.model.Filter("po_number", sap.ui.model.FilterOperator.EQ, poNumber));
            }

            if (releaseDate != "") {
                var arr = releaseDate.split('.')
                releaseDate = arr[2]+'-'+arr[1]+'-'+arr[0]+'T00:00:00Z'
                aFilters.push(new sap.ui.model.Filter("po_release_date", sap.ui.model.FilterOperator.EQ, releaseDate));
            }

            var mFilters = new sap.ui.model.Filter({
                filters: aFilters,
                and: true
            });
            
            var oTableBinding = this.getView().byId("idPurchaseOrdersTable").getBinding("items");
            oTableBinding.filter(mFilters);
        },

        // on Date Change
        onDateChange: function (oEvent) {
          var   oDP = oEvent.getSource(),
                sValue = oEvent.getParameter("value"),
                bValid = oEvent.getParameter("valid");

            if (bValid) {
                oDP.setValueState(sap.ui.core.ValueState.None);
            } else {
                oDP.setValueState(sap.ui.core.ValueState.Error);
            }
        },


    });
});
