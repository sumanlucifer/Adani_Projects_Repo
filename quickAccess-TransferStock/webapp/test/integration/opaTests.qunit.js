/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"com/agel/mmts/quickAccess-TransferStock/test/integration/AllJourneys"
	], function () {
		QUnit.start();
	});
});
