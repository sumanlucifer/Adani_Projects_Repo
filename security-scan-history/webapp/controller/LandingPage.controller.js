sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/Fragment",
],
	/**
	 * @param {typeof sap.ui.core.mvc.Controller} Controller
	 */
    function (BaseController, JSONModel, Filter, FilterOperator, Fragment) {
        "use strict";

        return BaseController.extend("com.agel.mmts.securityscanhistory.controller.LandingPage", {
            onInit: function () {

                //Router Object
                this.oRouter = this.getRouter();
                this.oRouter.getRoute("RouteLandingPage").attachPatternMatched(this._onObjectMatched, this);

                //view model instatiation
                var oViewModel = new JSONModel({
                    busy: false,
                    delay: 0
                });
                this.setModel(oViewModel, "objectViewModel");

                // Icon Tab Count Model
                var oIconTabCountModel = new JSONModel({
                    openCount: null,
                    confirmCount: null
                });
                this.setModel(oIconTabCountModel, "oIconTabCountModel");

                //adding searchfield association to filterbar and initialize the filter bar -> added in base controller
                this.initializeFilterBar();

            },

            _onObjectMatched: function (oEvent) {

            },

            onDateRangeSelectionChange: function (oEvent) {
                var sFrom = oEvent.getParameter("from"),
                    sTo = oEvent.getParameter("to"),
                    bValid = oEvent.getParameter("valid"),
                    oEventSource = oEvent.getSource(),
                    oText = this.byId("TextEvent");

                if (bValid) {
                    oEventSource.setValueState(ValueState.None);
                } else {
                    oEventSource.setValueState(ValueState.Error);
                }
                this.oFilterBar.fireFilterChange(oEvent);
            },
            // on Go Search 
            onSearch: function (oEvent) {
                var ponum = this.byId("idInpPoNo").getValue();
                var DateRange = this.byId("dateRangeSelectionId");
                var DateRangeValue = this.byId("dateRangeSelectionId").getValue();

                var orFilters = [];
                var andFilters = [];

                var FreeTextSearch = this.byId("filterbar").getBasicSearchValue();
                if (FreeTextSearch) {
                    orFilters.push(new Filter("PONumber", FilterOperator.Contains, FreeTextSearch));

                    andFilters.push(new Filter(orFilters, false));
                }

                // PO Number
                if (ponum != "") {
                    andFilters.push(new Filter("PONumber", FilterOperator.EQ, ponum));
                }
                // Created At
                if (DateRangeValue != "") {
                    var From = new Date(DateRange.getFrom());
                    var To = new Date(DateRange.getTo());
                    andFilters.push(new Filter("CreatedAt", FilterOperator.BT, From.toISOString(), To.toISOString()));
                }

                var idDomesticTableBinding = this.getView().byId("idDomesticTable").getTable().getBinding("items");
                var idInternationalTableBinding = this.getView().byId("idInternationalTable").getTable().getBinding("items");

                if (andFilters.length == 0) {
                    andFilters.push(new Filter("PONumber", FilterOperator.NE, ""));
                    idDomesticTableBinding.filter(new Filter(andFilters, true));
                    idInternationalTableBinding.filter(new Filter(andFilters, true));

                }

                if (andFilters.length > 0) {
                    idDomesticTableBinding.filter(new Filter(andFilters, true));
                    idInternationalTableBinding.filter(new Filter(andFilters, true));

                }
            },

            onResetFilters: function (oEvent) {
                this.oFilterBar._oBasicSearchField.setValue("");
                this.byId("idInpPoNo").setValue("");
                this.byId("dateRangeSelectionId").setValue("");

                var oTable = this.getView().byId("idDomesticTable").getTable();
                var oTable1 = this.getView().byId("idInternationalTable").getTable();
                if (oTable) {
                    var oBinding = oTable.getBinding("items");
                    oBinding.filter([]);
                }
                else {
                    var oBinding = oTable1.getBinding("items");
                    oBinding.filter([]);
                }
            },

            // onFilterChange: function (oEvent) {
            //     //   if (oEvent.getSource().getValue().length){
            //     this.filterbar.fireFilterChange(oEvent);
            //     //  }
            // },

            onInternationalTableUpdateFinished: function (oEvent) {
                //Setting the header context for a property binding to $count
                this.setIconTabCount(oEvent, oEvent.getParameter("total"), "/openCount");
            },

            onDomesticTableUpdateFinished: function (oEvent) {
                //Setting the header context for a property binding to $count                       
                this.setIconTabCount(oEvent, oEvent.getParameter("total"), "/confirmCount");
            },

            setIconTabCount: function (oEvent, total, property) {
                if (oEvent.getSource().getBinding("items").isLengthFinal()) {
                    this.getView().getModel("oIconTabCountModel").setProperty(property, total);
                }
            },



            // On Icon Tab Select
            onIconTabBarChanged: function (sKey) {
                if (sKey === "DomesticKey") {
                    this.byId("pageTitle").setText(this.getResourceBundle().getText("domestic"));
                } else if (sKey === "InternationalKey") {
                    this.byId("pageTitle").setText(this.getResourceBundle().getText("international"));
                }

            },

            // On Icon Tab Select
            onIconTabSelect: function (oEvent) {
                var that = this;
                var sKey = oEvent.getParameter("key");

                if (sKey === "DomesticKey") {
                    this.byId("pageTitle").setText(this.getResourceBundle().getText("domestic"));
                } else if (sKey === "InternationalKey") {
                    this.byId("pageTitle").setText(this.getResourceBundle().getText("international"));
                }
                that.onResetFilters();
            },

            _showObjectDomestic: function (oItem) {
                var that = this;
                var sObjectPath = oItem.getBindingContext().sPath;
                that.getRouter().navTo("RouteQRCodeDetail", {
                    QRNo: oItem.getBindingContext().getObject().PackingListId
                });
            },

            onDomesticEntryPress: function (oEvent) {
                // this.oRouter.navTo("RouteQRCodeDetail");
                this._showObjectDomestic(oEvent.getSource());
            }

            // onInternationalEntryPress: function (oEvent) {
            //     // this.oRouter.navTo("RouteQRCodeDetail");
            //     this._showObjectInternational(oEvent.getSource());
            // },

            // _showObjectInternational: function (oItem) {
            //     var that = this;
            //     var sObjectPath = oItem.getBindingContext().sPath;
            //     that.getRouter().navTo("RouteQRCodeDetail", {
            //         QRNo: oItem.getBindingContext().getObject().PackingListId
            //     });
            // }

        });
    });
