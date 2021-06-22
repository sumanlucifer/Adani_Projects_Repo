sap.ui.define([], function () {
    "use strict";

    return {

       availableState: function (sStateValue) {
			//var sStateValueToLower = sStateValue.toLowerCase();

			switch (sStateValue) {
				case "APPROVED":
					return 8;
				case "PENDING":
					return 5;
				case "REJECTED":
					return 3;
				default:
					return 9;
			}
        }
        



    };

});