sap.ui.define([], function () {
    "use strict";

    return {

       availableState: function (sStateValue) {
			//var sStateValueToLower = sStateValue.toLowerCase();

			switch (sStateValue) {
				case "APPROVED":
					return 8;
				case "PENDING":
					return 1;
				case "REJECTED":
					return 3;
				default:
					return 5;
			}
        },
        
        StatusText: function (sStateValue) {
			//var sStateValueToLower = sStateValue.toLowerCase();

			switch (sStateValue) {
				case "APPROVED":
					return "APPROVED";
				case "PENDING":
					return "PENDING";
				case "REJECTED":
					return "REJECTED";
				default:
					return "SAVED";
			}
        }



    };

});