/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"com/agel/mmts/quickAccess-Reports/test/integration/AllJourneys"
	], function () {
		QUnit.start();
	});
});
