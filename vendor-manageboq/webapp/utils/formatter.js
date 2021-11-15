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
        },

        toFiveDecimals: function (sValue) {
            if (sValue) {
                if (Number.isInteger(parseFloat(sValue))) {
                    return sValue;
                }
                else if (sValue.split(".")[1].length >= 5) {
                    return parseFloat(sValue).toFixed(5);
                }
                else {
                    return sValue;
                }
            } else {
                return "0";
            }
        }
    };

});