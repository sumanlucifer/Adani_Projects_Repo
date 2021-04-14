sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/Fragment",
    "sap/ui/model/Sorter",
    "sap/ui/Device",
    'sap/ui/core/ValueState'
], function (BaseController, JSONModel, Filter, FilterOperator, Fragment, Sorter, Device,ValueState) {
    "use strict";

    return BaseController.extend("com.agel.mmts.securityPerson-History.controller.LandingPage", {
        onInit: function () {
            //adding searchfield association to filterbar                                    
            this._addSearchFieldAssociationToFB();

            var oModel = new JSONModel({
                email: "rakeshpatil28@gmail.com"
            });
            this.setModel(oModel, "oModel");
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

        // on Go Search 
        onSearch: function (oEvent) {
            var poNumber = this.byId("idNameInput").getValue();
            var DateRange = this.byId("dateRangeSelectionId");
            var DateRangeValue = this.byId("dateRangeSelectionId").getValue();
            var vehicleNo = this.byId("idVehicleNObInput").getValue();
            var aFilters = [];
            
            var FreeTextSearch = this.getView().byId("filterbar").getBasicSearchValue();
            if(FreeTextSearch){
                aFilters.push(new Filter("po_number", FilterOperator.Contains, FreeTextSearch));
                aFilters.push(new Filter("packing_list_ID", FilterOperator.Contains, FreeTextSearch));
            //    aFilters.push(new Filter("purchase_order/parent_line_items/0/material_code", FilterOperator.EQ, FreeTextSearch));
            //    aFilters.push(new Filter("packing_list/vehicle_no", FilterOperator.EQ, FreeTextSearch));
            //    aFilters.push(new Filter("purchase_order/parent_line_items/0/qty", FilterOperator.EQ, FreeTextSearch));
            }
            if (poNumber) {
                aFilters.push(new Filter("po_number", FilterOperator.EQ, poNumber));
            }
            if (DateRangeValue != "") {
                var From=new Date(DateRange.getFrom());
                var To=new Date(DateRange.getTo());
                aFilters.push(new Filter("createdAt", FilterOperator.BT, From.toISOString(),To.toISOString()));
            }
            if ( vehicleNo ){
                aFilters.push(new Filter("packing_list/vehicle_no", FilterOperator.EQ, vehicleNo));     
            }       

            var mFilters = new Filter({
                filters: aFilters,
                and: true
            });

            var oTableBinding = this.getView().byId("idScannedMaterialHistoryTable").getBinding("items");
            oTableBinding.filter(mFilters);
        },

        onDateRangeSelectionChange : function(oEvent){
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
        },

        onScannedHistoryTableUpdateStarted: function (oEvent) {

        },

        onScannedHistoryItemPress: function (oEvent) {
            this._showObject(oEvent.getSource().getBindingContext().getObject().qr_code_ID);
        },

        _showObject: function (sQRCodeID) {
                var that = this;
                var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
                oCrossAppNavigator.isIntentSupported(["ScanQR-SecurityPerson"])
                    .done(function (aResponses) {})
                    .fail(function () {
                        new sap.m.MessageToast("Provide corresponding intent to navigate");
                    });
                // generate the Hash to display a employee Id
                var hash = (oCrossAppNavigator && oCrossAppNavigator.hrefForExternal({
                    target: {
                        semanticObject: "ScanQR",
                        action: "SecurityPerson"
                    }
                })) || "";
                //Generate a URL for the second application
                var sUrl = window.location.href.split('#')[0] + hash + "&/BarCodeDetails/" +sQRCodeID;
                console.log({sUrl});
                //Navigate to second app
                //sap.m.URLHelper.redirect(url, true);
                window.open(sUrl, "_self");
        },
    });
});
