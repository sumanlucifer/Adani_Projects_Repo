sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel"

],

    function (BaseController, JSONModel) {
        "use strict";
        return BaseController.extend("com.agel.mmts.storestock.controller.chartDisplay", {

            onInit: function () {
                var sampleDatajson = new sap.ui.model.json.JSONModel("model/Data.json");

              
                this.getModel().setData({

                    segement: {
                        dept: null,
                        count: null
                    },

                    vizdata: []
                      


                });

                var data = {
	"items": [{
		"Department": "R & D",
		"EmployeeCount": "20"
	}, {
		"Department": "Syngenta",
		"EmployeeCount": "30"
	}, {
		"Department": "Volvo",
		"EmployeeCount": "35"
	}, {
		"Department": "NIKE",
		"EmployeeCount": "60"
	}, {
		"Department": "ADIDAS",
		"EmployeeCount": "70"
	}]
};
                this.getModel().setProperty("/vizdata", data);

            },

            onPressSegment: function (eve) {
                var dept = eve.getParameters().data[0].data.Department;
                var count = eve.getParameters().data[0].data.count;
                this.getModel().setProperty("/segement/dept", dept);
                this.getModel().setProperty("/segement/dept", count);
                this.segmentPage();
            },


            segmentPage: function (oEvent) {
                this.getRouter().navTo("storeStockParentDetail");
            }


        });
    });
